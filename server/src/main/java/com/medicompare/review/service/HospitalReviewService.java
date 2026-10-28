package com.medicompare.review.service;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.review.dto.ReviewResponse;
import com.medicompare.review.dto.ReviewSummaryResponse;
import com.medicompare.review.entity.HospitalReview;
import com.medicompare.review.repository.HospitalReviewRepository;
import com.medicompare.user.entity.User;
import com.medicompare.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HospitalReviewService {

    private final HospitalReviewRepository reviewRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    public HospitalReviewService(
            HospitalReviewRepository reviewRepository,
            HospitalRepository hospitalRepository,
            UserRepository userRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.hospitalRepository = hospitalRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse createReview(
            Long userId,
            Long hospitalId,
            Integer rating,
            String comment
    ) {

        validateReview(rating, comment);

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found."
                        )
                );

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Hospital not found."
                        )
                );

        if (reviewRepository.existsByUserIdAndHospitalId(
                userId,
                hospitalId
        )) {
            throw new IllegalStateException(
                    "You have already reviewed this hospital."
            );
        }

        HospitalReview review =
                new HospitalReview();

        review.setUser(user);
        review.setHospital(hospital);
        review.setRating(rating);
        review.setComment(comment.trim());

        return ReviewResponse.from(
                reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse updateReview(
            Long userId,
            Long reviewId,
            Integer rating,
            String comment
    ) {

        validateReview(rating, comment);

        HospitalReview review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Review not found."
                                )
                        );

        if (!review.getUser().getId().equals(userId)) {
            throw new SecurityException(
                    "You can only edit your own review."
            );
        }

        review.setRating(rating);
        review.setComment(comment.trim());

        return ReviewResponse.from(
                reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(
            Long userId,
            Long reviewId
    ) {

        HospitalReview review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Review not found."
                                )
                        );

        if (!review.getUser().getId().equals(userId)) {
            throw new SecurityException(
                    "You can only delete your own review."
            );
        }

        reviewRepository.delete(review);
    }

    /*
     * Mapped to DTOs INSIDE the transaction: user/hospital are LAZY
     * associations and mapping outside the session throws
     * LazyInitializationException (reviews saved fine but never
     * displayed). Never return detached entities to the controller.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getHospitalReviews(
            Long hospitalId
    ) {

        validateHospital(hospitalId);

        return reviewRepository
                .findByHospitalIdOrderByCreatedAtDesc(
                        hospitalId
                )
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Double getAverageRating(
            Long hospitalId
    ) {

        validateHospital(hospitalId);

        Double average =
                reviewRepository.getAverageRating(
                        hospitalId
                );

        if (average == null) {
            return 0.0;
        }

        return Math.round(
                average * 100.0
        ) / 100.0;
    }

    @Transactional(readOnly = true)
    public long getReviewCount(
            Long hospitalId
    ) {

        validateHospital(hospitalId);

        return reviewRepository.getReviewCount(
                hospitalId
        );
    }

    /*
     * COMPLETE REVIEW SUMMARY
     *
     * This is the data that our recommendation
     * engine will use later.
     */

    @Transactional(readOnly = true)
    public ReviewSummaryResponse getReviewSummary(
            Long hospitalId
    ) {

        validateHospital(hospitalId);

        Double averageRating =
                getAverageRating(hospitalId);

        long totalReviews =
                reviewRepository.getReviewCount(
                        hospitalId
                );

        Map<Integer, Long> distribution =
                new LinkedHashMap<>();

        /*
         * Always return all five ratings,
         * even when a rating has zero reviews.
         */

        for (int rating = 5; rating >= 1; rating--) {

            long count =
                    reviewRepository
                            .countByHospitalIdAndRating(
                                    hospitalId,
                                    rating
                            );

            distribution.put(
                    rating,
                    count
            );
        }

        return new ReviewSummaryResponse(
                hospitalId,
                averageRating,
                totalReviews,
                distribution
        );
    }

    private void validateReview(
            Integer rating,
            String comment
    ) {

        if (rating == null
                || rating < 1
                || rating > 5) {

            throw new IllegalArgumentException(
                    "Rating must be between 1 and 5."
            );
        }

        if (comment == null
                || comment.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Review comment is required."
            );
        }

        if (comment.trim().length() > 2000) {

            throw new IllegalArgumentException(
                    "Review comment cannot exceed 2000 characters."
            );
        }
    }

    private void validateHospital(
            Long hospitalId
    ) {

        if (!hospitalRepository.existsById(hospitalId)) {

            throw new IllegalArgumentException(
                    "Hospital not found."
            );
        }
    }
}