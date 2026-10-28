package com.medicompare.recommendation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class RecommendationRequest {

    @NotBlank(message = "Service is required")
    private String service;

    private String city;

    @Min(value = 0, message = "Budget cannot be negative")
    private Double maxBudget;

    @Min(value = 0, message = "Minimum rating cannot be negative")
    @Max(value = 5, message = "Minimum rating cannot exceed 5")
    private Double minRating;

    private String hospitalType;

    public RecommendationRequest() {
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Double getMaxBudget() {
        return maxBudget;
    }

    public void setMaxBudget(Double maxBudget) {
        this.maxBudget = maxBudget;
    }

    public Double getMinRating() {
        return minRating;
    }

    public void setMinRating(Double minRating) {
        this.minRating = minRating;
    }

    public String getHospitalType() {
        return hospitalType;
    }

    public void setHospitalType(String hospitalType) {
        this.hospitalType = hospitalType;
    }
}