package com.medicompare.serviceentity;

import com.medicompare.entity.Hospital;

import java.math.BigDecimal;

public class ServiceSearchResponse {

    private Long serviceId;

    private String serviceName;

    private String description;

    private BigDecimal price;

    private String category;

    private Integer durationMinutes;

    private Boolean available;

    private Hospital hospital;

    public ServiceSearchResponse() {
    }

    public ServiceSearchResponse(
            HospitalService service
    ) {

        this.serviceId =
                service.getId();

        this.serviceName =
                service.getName();

        this.description =
                service.getDescription();

        this.price =
                service.getPrice();

        this.category =
                service.getCategory();

        this.durationMinutes =
                service.getDurationMinutes();

        this.available =
                service.getAvailable();

        this.hospital =
                service.getHospital();
    }

    // =========================
    // GETTERS
    // =========================

    public Long getServiceId() {
        return serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCategory() {
        return category;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public Boolean getAvailable() {
        return available;
    }

    public Hospital getHospital() {
        return hospital;
    }

    // =========================
    // SETTERS
    // =========================

    public void setServiceId(
            Long serviceId
    ) {
        this.serviceId = serviceId;
    }

    public void setServiceName(
            String serviceName
    ) {
        this.serviceName = serviceName;
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

    public void setCategory(
            String category
    ) {
        this.category = category;
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

    public void setHospital(
            Hospital hospital
    ) {
        this.hospital = hospital;
    }
}