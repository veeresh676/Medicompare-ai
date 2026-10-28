package com.medicompare.review.entity;

import com.medicompare.entity.Hospital;
import com.medicompare.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "hospital_reviews",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_review_user_hospital",
                        columnNames = {
                                "user_id",
                                "hospital_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_review_hospital",
                        columnList = "hospital_id"
                ),
                @Index(
                        name = "idx_review_user",
                        columnList = "user_id"
                )
        }
)
public class HospitalReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "hospital_id",
            nullable = false
    )
    private Hospital hospital;

    @Min(
            value = 1,
            message = "Rating must be at least 1"
    )
    @Max(
            value = 5,
            message = "Rating cannot exceed 5"
    )
    @Column(nullable = false)
    private Integer rating;

    @NotBlank(
            message = "Review comment is required"
    )
    @Column(
            nullable = false,
            length = 2000
    )
    private String comment;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public HospitalReview() {
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt = updatedAt;
    }
}