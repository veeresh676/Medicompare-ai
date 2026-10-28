package com.medicompare.serviceentity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HospitalServiceRepository extends JpaRepository<HospitalService, Long> {

    @Query("""
        SELECT hs
        FROM HospitalService hs
        LEFT JOIN FETCH hs.hospital
        WHERE hs.hospital.id = :hospitalId
        ORDER BY hs.id ASC
    """)
    List<HospitalService> findByHospitalId(
            @Param("hospitalId") Long hospitalId);

    long countByAvailableTrue();

    boolean existsByHospitalIdAndNameIgnoreCase(
            Long hospitalId,
            String name
    );

    @Query("""
        SELECT hs
        FROM HospitalService hs
        JOIN FETCH hs.hospital h
        WHERE hs.available = true
        AND (
            LOWER(hs.name) LIKE LOWER(CONCAT('%', :service, '%'))
            OR LOWER(COALESCE(hs.category, '')) LIKE LOWER(CONCAT('%', :service, '%'))
        )
        ORDER BY hs.price ASC
    """)
    List<HospitalService> searchAvailableServices(
            @Param("service") String service
    );

    @Query("""
        SELECT hs
        FROM HospitalService hs
        JOIN FETCH hs.hospital h
        WHERE hs.hospital.id = :hospitalId
        AND hs.available = true
        ORDER BY hs.price ASC
    """)
    List<HospitalService> findAvailableByHospitalId(
            @Param("hospitalId") Long hospitalId
    );
}