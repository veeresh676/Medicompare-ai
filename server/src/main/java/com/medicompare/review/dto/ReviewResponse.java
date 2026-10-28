package com.medicompare.review.dto;

import com.medicompare.review.entity.HospitalReview;

import java.time.LocalDateTime;

public class ReviewResponse {

    private Long id;
    private Long userId;
    private String userName;
    private Long hospitalId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReviewResponse() {
    }

    public static ReviewResponse from(
            HospitalReview review
    ) {

        ReviewResponse response =
                new ReviewResponse();

        response.setId(review.getId());

        response.setUserId(
                review.getUser().getId()
        );

        response.setUserName(
                review.getUser().getName()
        );

        response.setHospitalId(
                review.getHospital().getId()
        );

        response.setRating(
                review.getRating()
        );

        response.setComment(
                review.getComment()
        );

        response.setCreatedAt(
                review.getCreatedAt()
        );

        response.setUpdatedAt(
                review.getUpdatedAt()
        );

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
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