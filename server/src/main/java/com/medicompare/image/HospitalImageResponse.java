package com.medicompare.image;

/**
 * Safe JSON response for HospitalImage.
 * Never serializes the LAZY hospital association (500 cause).
 */
public class HospitalImageResponse {

    private Long id;
    private Long hospitalId;
    private String imageUrl;
    private String title;
    private String description;
    private String altText;
    private Boolean primaryImage;

    public HospitalImageResponse() {
    }

    public static HospitalImageResponse from(HospitalImage image) {
        HospitalImageResponse response = new HospitalImageResponse();
        response.setId(image.getId());
        try {
            response.setHospitalId(
                    image.getHospital() != null ? image.getHospital().getId() : null);
        } catch (Exception e) {
            response.setHospitalId(null);
        }
        response.setImageUrl(image.getImageUrl());
        response.setTitle(image.getTitle());
        response.setDescription(image.getDescription());
        response.setAltText(image.getAltText());
        response.setPrimaryImage(image.isPrimaryImage());
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAltText() {
        return altText;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }

    public Boolean getPrimaryImage() {
        return primaryImage;
    }

    public void setPrimaryImage(Boolean primaryImage) {
        this.primaryImage = primaryImage;
    }
}
