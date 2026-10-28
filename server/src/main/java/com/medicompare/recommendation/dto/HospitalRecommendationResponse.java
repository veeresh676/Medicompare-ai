package com.medicompare.recommendation.dto;

import java.math.BigDecimal;
import java.util.List;

public class HospitalRecommendationResponse {

    private Long hospitalId;
    private String hospitalName;
    private String city;
    private String hospitalType;

    private Double rating;

    private Double reviewAverage;
    private Long reviewCount;
    private Double reviewConfidence;

    private Double consultationFee;

    private String matchedService;
    private BigDecimal servicePrice;

    private boolean serviceAvailable;

    private double score;

    private String recommendationLevel;

    private List<String> reasons;

    public HospitalRecommendationResponse() {
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getHospitalType() {
        return hospitalType;
    }

    public void setHospitalType(String hospitalType) {
        this.hospitalType = hospitalType;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Double getReviewAverage() {
        return reviewAverage;
    }

    public void setReviewAverage(Double reviewAverage) {
        this.reviewAverage = reviewAverage;
    }

    public Long getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Long reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Double getReviewConfidence() {
        return reviewConfidence;
    }

    public void setReviewConfidence(Double reviewConfidence) {
        this.reviewConfidence = reviewConfidence;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getMatchedService() {
        return matchedService;
    }

    public void setMatchedService(String matchedService) {
        this.matchedService = matchedService;
    }

    public BigDecimal getServicePrice() {
        return servicePrice;
    }

    public void setServicePrice(BigDecimal servicePrice) {
        this.servicePrice = servicePrice;
    }

    public boolean isServiceAvailable() {
        return serviceAvailable;
    }

    public void setServiceAvailable(boolean serviceAvailable) {
        this.serviceAvailable = serviceAvailable;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getRecommendationLevel() {
        return recommendationLevel;
    }

    public void setRecommendationLevel(String recommendationLevel) {
        this.recommendationLevel = recommendationLevel;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }
}