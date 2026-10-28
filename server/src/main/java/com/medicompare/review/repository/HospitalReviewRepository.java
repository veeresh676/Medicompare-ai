package com.medicompare.review.repository;

import com.medicompare.review.entity.HospitalReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HospitalReviewRepository
        extends JpaRepository<HospitalReview, Long> {

    List<HospitalReview> findByHospitalIdOrderByCreatedAtDesc(
            Long hospitalId
    );

    Optional<HospitalReview> findByUserIdAndHospitalId(
            Long userId,
            Long hospitalId
    );

    boolean existsByUserIdAndHospitalId(
            Long userId,
            Long hospitalId
    );

    long countByHospitalId(
            Long hospitalId
    );

    @Query("""
        SELECT COALESCE(AVG(r.rating), 0)
        FROM HospitalReview r
        WHERE r.hospital.id = :hospitalId
    """)
    Double getAverageRating(
            @Param("hospitalId") Long hospitalId
    );

    @Query("""
        SELECT COUNT(r)
        FROM HospitalReview r
        WHERE r.hospital.id = :hospitalId
    """)
    long getReviewCount(
            @Param("hospitalId") Long hospitalId
    );

    /*
     * Number of reviews for each rating.
     *
     * Example:
     *
     * 5 stars -> 25
     * 4 stars -> 10
     * 3 stars -> 3
     * 2 stars -> 1
     * 1 star  -> 0
     */

    long countByHospitalIdAndRating(
            Long hospitalId,
            Integer rating
    );

    /**
     * Used once by the seed-review cleanup to remove reviews written
     * by the retired fake reviewer accounts. Real users are untouched.
     */
    void deleteByUserId(
            Long userId
    );

    long countByUserId(
            Long userId
    );
}