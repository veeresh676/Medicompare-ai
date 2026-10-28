package com.medicompare.compare.dto;

import java.math.BigDecimal;
import java.util.List;

public class HospitalComparisonResponse {

    private Long hospitalId;

    private String hospitalName;

    private String city;

    private String address;

    private String phoneNumber;

    private Double rating;

    private Double reviewAverage;

    private Long reviewCount;

    private Double consultationFee;

    private String hospitalType;

    private String imageUrl;

    private List<ServiceComparisonItem> services;

    public HospitalComparisonResponse() {
    }

    // =========================
    // GETTERS
    // =========================

    public Long getHospitalId() {
        return hospitalId;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public String getCity() {
        return city;
    }

    public String getAddress() {
        return address;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Double getRating() {
        return rating;
    }

    public Double getReviewAverage() {
        return reviewAverage;
    }

    public Long getReviewCount() {
        return reviewCount;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public String getHospitalType() {
        return hospitalType;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public List<ServiceComparisonItem> getServices() {
        return services;
    }

    // =========================
    // SETTERS
    // =========================

    public void setHospitalId(
            Long hospitalId
    ) {
        this.hospitalId = hospitalId;
    }

    public void setHospitalName(
            String hospitalName
    ) {
        this.hospitalName = hospitalName;
    }

    public void setCity(
            String city
    ) {
        this.city = city;
    }

    public void setAddress(
            String address
    ) {
        this.address = address;
    }

    public void setPhoneNumber(
            String phoneNumber
    ) {
        this.phoneNumber = phoneNumber;
    }

    public void setRating(
            Double rating
    ) {
        this.rating = rating;
    }

    public void setReviewAverage(
            Double reviewAverage
    ) {
        this.reviewAverage = reviewAverage;
    }

    public void setReviewCount(
            Long reviewCount
    ) {
        this.reviewCount = reviewCount;
    }

    public void setConsultationFee(
            Double consultationFee
    ) {
        this.consultationFee = consultationFee;
    }

    public void setHospitalType(
            String hospitalType
    ) {
        this.hospitalType = hospitalType;
    }

    public void setImageUrl(
            String imageUrl
    ) {
        this.imageUrl = imageUrl;
    }

    public void setServices(
            List<ServiceComparisonItem> services
    ) {
        this.services = services;
    }

    // =========================
    // SERVICE COMPARISON ITEM
    // =========================

    public static class ServiceComparisonItem {

        private Long serviceId;

        private String name;

        private String category;

        private String description;

        private BigDecimal price;

        private Integer durationMinutes;

        private Boolean available;

        public ServiceComparisonItem() {
        }

        // =========================
        // GETTERS
        // =========================

        public Long getServiceId() {
            return serviceId;
        }

        public String getName() {
            return name;
        }

        public String getCategory() {
            return category;
        }

        public String getDescription() {
            return description;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public Integer getDurationMinutes() {
            return durationMinutes;
        }

        public Boolean getAvailable() {
            return available;
        }

        // =========================
        // SETTERS
        // =========================

        public void setServiceId(
                Long serviceId
        ) {
            this.serviceId = serviceId;
        }

        public void setName(
                String name
        ) {
            this.name = name;
        }

        public void setCategory(
                String category
        ) {
            this.category = category;
        }

        public void setDescription(
                String description
        ) {
            this.description = description;
        }

        public void setPrice(
                BigDecimal price
        ) {
            this.price = price;
        }

        public void setDurationMinutes(
                Integer durationMinutes
        ) {
            this.durationMinutes =
                    durationMinutes;
        }

        public void setAvailable(
                Boolean available
        ) {
            this.available = available;
        }
    }
}