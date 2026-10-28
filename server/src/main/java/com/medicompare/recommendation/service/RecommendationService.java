package com.medicompare.recommendation.service;

import com.medicompare.entity.Hospital;
import com.medicompare.recommendation.dto.HospitalRecommendationResponse;
import com.medicompare.recommendation.dto.RecommendationRequest;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.review.repository.HospitalReviewRepository;
import com.medicompare.serviceentity.HospitalService;
import com.medicompare.serviceentity.HospitalServiceRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class RecommendationService {

    private final HospitalRepository hospitalRepository;
    private final HospitalServiceRepository serviceRepository;
    private final HospitalReviewRepository reviewRepository;

    public RecommendationService(
            HospitalRepository hospitalRepository,
            HospitalServiceRepository serviceRepository,
            HospitalReviewRepository reviewRepository
    ) {
        this.hospitalRepository = hospitalRepository;
        this.serviceRepository = serviceRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<HospitalRecommendationResponse> recommend(
            RecommendationRequest request
    ) {

        List<Hospital> hospitals =
                hospitalRepository.findAll();

        String requestedService =
                request.getService()
                        .trim()
                        .toLowerCase(Locale.ROOT);

        List<HospitalRecommendationResponse> results =
                new ArrayList<>();

        for (Hospital hospital : hospitals) {

            if (!matchesCity(
                    hospital,
                    request.getCity()
            )) {
                continue;
            }

            if (!matchesHospitalType(
                    hospital,
                    request.getHospitalType()
            )) {
                continue;
            }

            if (!matchesRating(
                    hospital,
                    request.getMinRating()
            )) {
                continue;
            }

            List<HospitalService> services =
                    serviceRepository.findByHospitalId(
                            hospital.getId()
                    );

            HospitalService matchedService =
                    findMatchingService(
                            services,
                            requestedService
                    );

            if (matchedService == null) {
                continue;
            }

            boolean available =
                    matchedService.getAvailable() == null
                            || matchedService.getAvailable();

            if (!available) {
                continue;
            }

            if (!matchesBudget(
                    matchedService,
                    request.getMaxBudget()
            )) {
                continue;
            }

            HospitalRecommendationResponse response =
                    buildRecommendation(
                            hospital,
                            matchedService,
                            request
                    );

            results.add(response);
        }

        results.sort(
                Comparator.comparingDouble(
                        HospitalRecommendationResponse::getScore
                ).reversed()
        );

        return results;
    }

    private HospitalService findMatchingService(
            List<HospitalService> services,
            String requestedService
    ) {

        if (services == null) {
            return null;
        }

        for (HospitalService service : services) {

            if (service.getName() == null) {
                continue;
            }

            String name =
                    service.getName()
                            .toLowerCase(Locale.ROOT);

            String category =
                    service.getCategory() == null
                            ? ""
                            : service.getCategory()
                                    .toLowerCase(Locale.ROOT);

            if (name.equals(requestedService)) {
                return service;
            }

            if (name.contains(requestedService)
                    || requestedService.contains(name)) {
                return service;
            }

            if (!category.isBlank()
                    && (category.contains(requestedService)
                    || requestedService.contains(category))) {
                return service;
            }
        }

        return null;
    }

    private boolean matchesCity(
            Hospital hospital,
            String city
    ) {

        if (city == null || city.isBlank()) {
            return true;
        }

        if (hospital.getCity() == null) {
            return false;
        }

        return hospital.getCity()
                .equalsIgnoreCase(city.trim());
    }

    private boolean matchesHospitalType(
            Hospital hospital,
            String hospitalType
    ) {

        if (hospitalType == null
                || hospitalType.isBlank()) {
            return true;
        }

        if (hospital.getHospitalType() == null) {
            return false;
        }

        return hospital.getHospitalType()
                .equalsIgnoreCase(
                        hospitalType.trim()
                );
    }

    private boolean matchesRating(
            Hospital hospital,
            Double minRating
    ) {

        if (minRating == null) {
            return true;
        }

        if (hospital.getRating() == null) {
            return false;
        }

        return hospital.getRating() >= minRating;
    }

    private boolean matchesBudget(
            HospitalService service,
            Double maxBudget
    ) {

        if (maxBudget == null) {
            return true;
        }

        if (service.getPrice() == null) {
            return false;
        }

        return service.getPrice()
                .doubleValue() <= maxBudget;
    }

    private HospitalRecommendationResponse buildRecommendation(
            Hospital hospital,
            HospitalService service,
            RecommendationRequest request
    ) {

        double score = 0;

        List<String> reasons =
                new ArrayList<>();

        /*
         * SERVICE MATCH
         * 30 points
         */

        score += 30;

        reasons.add(
                "Offers the requested service."
        );

        /*
         * USER REVIEWS + HOSPITAL RATING
         *
         * Combines the hospital's existing rating
         * with actual reviews submitted by users.
         */

        Double hospitalRating =
                hospital.getRating();

        Double reviewAverage =
                reviewRepository.getAverageRating(
                        hospital.getId()
                );

        long reviewCount =
                reviewRepository.getReviewCount(
                        hospital.getId()
                );

        double reviewConfidence =
                Math.min(
                        reviewCount / 50.0,
                        1.0
                );

        double qualityScore =
                calculateReviewAwareQualityScore(
                        hospitalRating,
                        reviewAverage,
                        reviewCount
                );

        /*
         * QUALITY
         * 25 points
         */

        score += qualityScore * 25.0;

        addQualityReasons(
                reasons,
                hospitalRating,
                reviewAverage,
                reviewCount
        );

        /*
         * PRICE
         * 25 points
         */

        BigDecimal price =
                service.getPrice();

        if (price != null) {

            double priceValue =
                    price.doubleValue();

            if (request.getMaxBudget() != null
                    && request.getMaxBudget() > 0) {

                double budget =
                        request.getMaxBudget();

                double ratio =
                        Math.min(
                                priceValue / budget,
                                1.0
                        );

                score +=
                        (1.0 - ratio) * 25.0;

                if (priceValue <= budget * 0.5) {

                    reasons.add(
                            "Service price is well within your budget."
                    );

                } else {

                    reasons.add(
                            "Service price fits your budget."
                    );
                }

            } else {

                score += 12.5;

                reasons.add(
                        "Service price is available for comparison."
                );
            }
        }

        /*
         * AVAILABILITY
         * 10 points
         */

        if (service.getAvailable() == null
                || service.getAvailable()) {

            score += 10;

            reasons.add(
                    "Service is currently available."
            );
        }

        /*
         * LOCATION
         * 10 points
         */

        if (request.getCity() != null
                && !request.getCity().isBlank()
                && hospital.getCity() != null
                && hospital.getCity()
                .equalsIgnoreCase(
                        request.getCity().trim()
                )) {

            score += 10;

            reasons.add(
                    "Hospital is located in your selected city."
            );

        } else {

            score += 5;
        }

        HospitalRecommendationResponse response =
                new HospitalRecommendationResponse();

        response.setHospitalId(
                hospital.getId()
        );

        response.setHospitalName(
                hospital.getName()
        );

        response.setCity(
                hospital.getCity()
        );

        response.setHospitalType(
                hospital.getHospitalType()
        );

        response.setRating(
                hospitalRating
        );

        /*
         * REAL USER REVIEW DATA
         */

        response.setReviewAverage(
                reviewAverage
        );

        response.setReviewCount(
                reviewCount
        );

        response.setReviewConfidence(
                reviewConfidence
        );

        response.setConsultationFee(
                hospital.getConsultationFee()
        );

        response.setMatchedService(
                service.getName()
        );

        response.setServicePrice(
                service.getPrice()
        );

        response.setServiceAvailable(
                service.getAvailable() == null
                        || service.getAvailable()
        );

        response.setScore(
                Math.min(
                        Math.round(score * 100.0) / 100.0,
                        100.0
                )
        );

        response.setRecommendationLevel(
                getRecommendationLevel(score)
        );

        response.setReasons(
                reasons
        );

        return response;
    }

    private double calculateReviewAwareQualityScore(
            Double hospitalRating,
            Double reviewAverage,
            long reviewCount
    ) {

        double baseRating =
                hospitalRating == null
                        ? 3.0
                        : hospitalRating;

        double reviewRating =
                reviewAverage == null
                        || reviewAverage <= 0
                        ? baseRating
                        : reviewAverage;

        double reviewConfidence =
                Math.min(
                        reviewCount / 50.0,
                        1.0
                );

        double weightedRating =
                (baseRating * (1.0 - reviewConfidence))
                        + (reviewRating * reviewConfidence);

        return clamp(
                weightedRating / 5.0,
                0.0,
                1.0
        );
    }

    private void addQualityReasons(
            List<String> reasons,
            Double hospitalRating,
            Double reviewAverage,
            long reviewCount
    ) {

        if (reviewCount > 0
                && reviewAverage != null
                && reviewAverage > 0) {

            reasons.add(
                    String.format(
                            Locale.US,
                            "Real users rate this hospital %.1f/5 based on %d review%s.",
                            reviewAverage,
                            reviewCount,
                            reviewCount == 1
                                    ? ""
                                    : "s"
                    )
            );

            if (reviewCount >= 50) {

                reasons.add(
                        "Recommendation uses a strong review sample."
                );
            }

        } else if (hospitalRating != null) {

            reasons.add(
                    String.format(
                            Locale.US,
                            "Hospital has a %.1f/5 rating.",
                            hospitalRating
                    )
            );

            reasons.add(
                    "Limited user-review data is currently available."
            );
        }
    }

    private String getRecommendationLevel(
            double score
    ) {

        if (score >= 85) {
            return "HIGHLY_RECOMMENDED";
        }

        if (score >= 70) {
            return "RECOMMENDED";
        }

        if (score >= 55) {
            return "GOOD_OPTION";
        }

        return "ALTERNATIVE";
    }

    private double clamp(
            double value,
            double minimum,
            double maximum
    ) {

        return Math.max(
                minimum,
                Math.min(maximum, value)
        );
    }
}