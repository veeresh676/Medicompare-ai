package com.medicompare.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Hospital name is required")
    @Size(max = 200, message = "Hospital name cannot exceed 200 characters")
    @Column(nullable = false, length = 200)
    private String name;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City cannot exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String city;

    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;

    @Size(max = 30, message = "Phone number cannot exceed 30 characters")
    private String phoneNumber;

    @DecimalMin(
            value = "0.0",
            message = "Rating cannot be negative"
    )
    @DecimalMax(
            value = "5.0",
            message = "Rating cannot be greater than 5"
    )
    private Double rating;

    @DecimalMin(
            value = "0.0",
            message = "Consultation fee cannot be negative"
    )
    private Double consultationFee;

    @Size(max = 100, message = "State cannot exceed 100 characters")
    @Column(length = 100)
    private String state;

    private Double latitude;

    private Double longitude;

    @Size(max = 500, message = "Location cannot exceed 500 characters")
    private String location;

    @Size(max = 50, message = "Hospital type cannot exceed 50 characters")
    private String hospitalType;

    @Size(
            max = 2000,
            message = "Description cannot exceed 2000 characters"
    )
    @Column(length = 2000)
    private String description;

    @Size(
            max = 1000,
            message = "Image URL cannot exceed 1000 characters"
    )
    @Column(length = 1000)
    private String imageUrl;

    /*
     * TRUE = consultation fee was auto-assigned by seeding and may be
     * re-jittered for uniqueness. FALSE = an administrator set this
     * fee explicitly and it must never be touched.
     */
    @Column
    private Boolean feeAutoPriced = true;

    public Hospital() {
    }

    public Hospital(
            String name,
            String city,
            String address,
            String phoneNumber,
            Double rating,
            Double consultationFee,
            String location,
            String hospitalType,
            String description,
            String imageUrl
    ) {
        this.name = name;
        this.city = city;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.rating = rating;
        this.consultationFee = consultationFee;
        this.location = location;
        this.hospitalType = hospitalType;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getHospitalType() {
        return hospitalType;
    }

    public void setHospitalType(String hospitalType) {
        this.hospitalType = hospitalType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getFeeAutoPriced() {
        return feeAutoPriced;
    }

    public void setFeeAutoPriced(Boolean feeAutoPriced) {
        this.feeAutoPriced = feeAutoPriced;
    }
}