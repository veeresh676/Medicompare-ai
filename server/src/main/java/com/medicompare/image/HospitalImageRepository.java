package com.medicompare.image;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HospitalImageRepository
        extends JpaRepository<HospitalImage, Long> {

    @Query("""
        SELECT i
        FROM HospitalImage i
        LEFT JOIN FETCH i.hospital
        WHERE i.hospital.id = :hospitalId
        ORDER BY i.id ASC
    """)
    List<HospitalImage> findByHospitalId(
            @Param("hospitalId") Long hospitalId);

    List<HospitalImage> findByHospitalIdAndPrimaryImageTrue(
            Long hospitalId
    );

    Optional<HospitalImage> findByIdAndHospitalId(
            Long imageId,
            Long hospitalId
    );

    long countByHospitalId(Long hospitalId);
}