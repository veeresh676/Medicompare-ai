package com.medicompare.serviceentity;

import java.math.BigDecimal;

/**
 * Safe JSON response for HospitalService.
 *
 * Returning the JPA entity directly causes 500 because the LAZY
 * hospital association cannot be serialized with open-in-view=false
 * (LazyInitializationException / Jackson proxy failure).
 * This DTO carries only primitives + hospitalId.
 */
public class HospitalServiceResponse {

    private Long id;
    private Long hospitalId;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private Integer durationMinutes;
    private Boolean available;

    public HospitalServiceResponse() {
    }

    public static HospitalServiceResponse from(HospitalService service) {
        HospitalServiceResponse response = new HospitalServiceResponse();
        response.setId(service.getId());
        try {
            // getId() on a LAZY proxy does NOT trigger a DB load - safe without transaction
            response.setHospitalId(
                    service.getHospital() != null ? service.getHospital().getId() : null);
        } catch (Exception e) {
            response.setHospitalId(null);
        }
        response.setName(service.getName());
        response.setDescription(service.getDescription());
        response.setPrice(service.getPrice());
        response.setCategory(service.getCategory());
        response.setDurationMinutes(service.getDurationMinutes());
        response.setAvailable(service.getAvailable());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }
}
