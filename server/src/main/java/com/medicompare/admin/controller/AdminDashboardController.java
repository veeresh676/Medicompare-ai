package com.medicompare.admin.controller;

import com.medicompare.image.HospitalImageRepository;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.serviceentity.HospitalServiceRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final HospitalRepository hospitalRepository;
    private final HospitalServiceRepository serviceRepository;
    private final HospitalImageRepository imageRepository;

    public AdminDashboardController(
            HospitalRepository hospitalRepository,
            HospitalServiceRepository serviceRepository,
            HospitalImageRepository imageRepository
    ) {
        this.hospitalRepository = hospitalRepository;
        this.serviceRepository = serviceRepository;
        this.imageRepository = imageRepository;
    }

    // ==========================================
    // GET DASHBOARD STATISTICS
    // ==========================================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStatistics() {

        long totalHospitals =
                hospitalRepository.count();

        long totalServices =
                serviceRepository.count();

        long availableServices =
                serviceRepository.countByAvailableTrue();

        long totalImages =
                imageRepository.count();

        /*
         * Every HospitalService currently has a required
         * price field, so the number of prices corresponds
         * to the number of services.
         */
        long totalPrices = totalServices;

        Map<String, Long> statistics =
                new LinkedHashMap<>();

        statistics.put(
                "hospitals",
                totalHospitals
        );

        statistics.put(
                "services",
                totalServices
        );

        statistics.put(
                "availableServices",
                availableServices
        );

        statistics.put(
                "prices",
                totalPrices
        );

        statistics.put(
                "images",
                totalImages
        );

        return ResponseEntity.ok(statistics);
    }
}