package com.medicompare.serviceentity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.medicompare.entity.Hospital;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

@Entity
@Table(
        name = "hospital_services",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_hospital_service_name",
                        columnNames = {"hospital_id", "name"}
                )
        }
)
public class HospitalService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // HOSPITAL
    // =========================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "hospital_id",
            nullable = false
    )
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Hospital hospital;

    // =========================
    // SERVICE NAME
    // =========================

    @NotBlank(
            message = "Service name is required"
    )
    @Column(
            nullable = false,
            length = 150
    )
    private String name;

    // =========================
    // DESCRIPTION
    // =========================

    @Column(length = 1000)
    private String description;

    // =========================
    // PRICE
    // =========================

    @NotNull(
            message = "Service price is required"
    )
    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "Service price cannot be negative"
    )
    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal price;

    // =========================
    // CATEGORY
    // =========================

    @Column(length = 100)
    private String category;

    // =========================
    // DURATION
    // =========================

    @Positive(
            message = "Duration must be greater than zero"
    )
    private Integer durationMinutes;

    // =========================
    // AVAILABILITY
    // =========================

    @Column(
            nullable = false
    )
    private Boolean available = true;

    /*
     * TRUE = price was auto-assigned by seed/migration logic and may
     * be re-jittered for uniqueness. FALSE = an administrator set
     * this price explicitly and it must never be touched.
     */
    @Column
    private Boolean autoPriced = true;

    // =========================
    // CONSTRUCTOR
    // =========================

    public HospitalService() {
    }

    // =========================
    // GETTERS / SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
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

    public Boolean getAutoPriced() {
        return autoPriced;
    }

    public void setAutoPriced(Boolean autoPriced) {
        this.autoPriced = autoPriced;
    }
}