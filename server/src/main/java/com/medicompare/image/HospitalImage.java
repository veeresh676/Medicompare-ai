package com.medicompare.image;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.medicompare.entity.Hospital;
import jakarta.persistence.*;

@Entity
@Table(name = "hospital_images")
public class HospitalImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    @JsonIgnore
    private Hospital hospital;

    @Column(nullable = false, length = 2000)
    private String imageUrl;

    @Column(length = 255)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(length = 500)
    private String altText;

    @Column(nullable = false)
    private Boolean primaryImage = false;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public HospitalImage() {
    }


    // =========================================================
    // ID
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    // =========================================================
    // HOSPITAL
    // =========================================================

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }


    // =========================================================
    // IMAGE URL
    // =========================================================

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }


    // =========================================================
    // TITLE
    // =========================================================

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    // =========================================================
    // DESCRIPTION
    // =========================================================

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    // =========================================================
    // ALT TEXT
    // =========================================================

    public String getAltText() {
        return altText;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }


    // =========================================================
    // PRIMARY IMAGE
    // =========================================================

    public Boolean getPrimaryImage() {
        return primaryImage;
    }

    public void setPrimaryImage(Boolean primaryImage) {
        this.primaryImage = primaryImage;
    }


    /*
     * Some existing controller code uses:
     *
     *     image.isPrimaryImage()
     *
     * Keep this method so both styles work.
     */
    public boolean isPrimaryImage() {
        return Boolean.TRUE.equals(primaryImage);
    }
}