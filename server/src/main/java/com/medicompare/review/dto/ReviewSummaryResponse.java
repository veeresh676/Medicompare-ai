package com.medicompare.review.dto;

import java.util.Map;

public class ReviewSummaryResponse {

    private Long hospitalId;

    private Double averageRating;

    private Long totalReviews;

    private Map<Integer, Long> ratingDistribution;

    public ReviewSummaryResponse() {
    }

    public ReviewSummaryResponse(
            Long hospitalId,
            Double averageRating,
            Long totalReviews,
            Map<Integer, Long> ratingDistribution
    ) {
        this.hospitalId = hospitalId;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.ratingDistribution = ratingDistribution;
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public Map<Integer, Long> getRatingDistribution() {
        return ratingDistribution;
    }

    public void setRatingDistribution(
            Map<Integer, Long> ratingDistribution
    ) {
        this.ratingDistribution =
                ratingDistribution;
    }
}