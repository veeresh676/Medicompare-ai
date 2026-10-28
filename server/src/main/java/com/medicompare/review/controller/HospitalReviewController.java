package com.medicompare.review.controller;

import com.medicompare.review.dto.CreateReviewRequest;
import com.medicompare.review.dto.ReviewResponse;
import com.medicompare.review.dto.ReviewSummaryResponse;
import com.medicompare.review.service.HospitalReviewService;
import com.medicompare.user.entity.User;
import com.medicompare.user.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class HospitalReviewController {

    private final HospitalReviewService reviewService;
    private final UserRepository userRepository;

    public HospitalReviewController(
            HospitalReviewService reviewService,
            UserRepository userRepository
    ) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    /*
     * =========================================================
     * GET ALL REVIEWS FOR A HOSPITAL
     * =========================================================
     */

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<ReviewResponse>> getHospitalReviews(
            @PathVariable Long hospitalId
    ) {

        return ResponseEntity.ok(
                reviewService.getHospitalReviews(hospitalId));
    }


    /*
     * =========================================================
     * GET REVIEW SUMMARY
     *
     * Returns:
     *
     * average rating
     * total reviews
     * 1-5 star distribution
     * =========================================================
     */

    @GetMapping("/hospital/{hospitalId}/summary")
    public ResponseEntity<ReviewSummaryResponse> getReviewSummary(
            @PathVariable Long hospitalId
    ) {

        return ResponseEntity.ok(
                reviewService.getReviewSummary(
                        hospitalId
                )
        );
    }


    /*
     * =========================================================
     * CREATE REVIEW
     * =========================================================
     */

    @PostMapping("/hospital/{hospitalId}")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long hospitalId,
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication
    ) {

        User user =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                reviewService.createReview(
                        user.getId(),
                        hospitalId,
                        request.getRating(),
                        request.getComment()
                ));
    }


    /*
     * =========================================================
     * UPDATE REVIEW
     * =========================================================
     */

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication
    ) {

        User user =
                getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                reviewService.updateReview(
                        user.getId(),
                        reviewId,
                        request.getRating(),
                        request.getComment()
                ));
    }


    /*
     * =========================================================
     * DELETE REVIEW
     * =========================================================
     */

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication
    ) {

        User user =
                getAuthenticatedUser(authentication);

        reviewService.deleteReview(
                user.getId(),
                reviewId
        );

        return ResponseEntity.noContent()
                .build();
    }


    /*
     * =========================================================
     * AUTHENTICATED USER
     * =========================================================
     */

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                authentication.getName() == null
        ) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in to write a review."
            );
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "Only user accounts can write reviews. "
                                        + "Please sign in with a user account."
                        )
                );
    }
}