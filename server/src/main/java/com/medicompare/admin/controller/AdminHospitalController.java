package com.medicompare.admin.controller;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/hospitals")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHospitalController {

    private final HospitalRepository hospitalRepository;

    public AdminHospitalController(
            HospitalRepository hospitalRepository
    ) {
        this.hospitalRepository = hospitalRepository;
    }

    @GetMapping
    public ResponseEntity<List<Hospital>> getAllHospitals() {

        return ResponseEntity.ok(
                hospitalRepository.findAll()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospitalById(
            @PathVariable Long id
    ) {

        return hospitalRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(
                        () -> ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @PostMapping
    public ResponseEntity<Hospital> createHospital(
            @Valid @RequestBody Hospital hospital
    ) {

        hospital.setId(null);

        // Administrator-priced fee: the uniqueness migration must never touch it.
        hospital.setFeeAutoPriced(false);

        Hospital savedHospital =
                hospitalRepository.save(hospital);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedHospital);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Hospital> updateHospital(
            @PathVariable Long id,
            @Valid @RequestBody Hospital updatedHospital
    ) {

        return hospitalRepository.findById(id)
                .map(existingHospital -> {

                    existingHospital.setName(
                            updatedHospital.getName()
                    );

                    existingHospital.setCity(
                            updatedHospital.getCity()
                    );

                    existingHospital.setAddress(
                            updatedHospital.getAddress()
                    );

                    existingHospital.setPhoneNumber(
                            updatedHospital.getPhoneNumber()
                    );

                    existingHospital.setRating(
                            updatedHospital.getRating()
                    );

                    existingHospital.setConsultationFee(
                            updatedHospital.getConsultationFee()
                    );

                    existingHospital.setLocation(
                            updatedHospital.getLocation()
                    );

                    existingHospital.setHospitalType(
                            updatedHospital.getHospitalType()
                    );

                    existingHospital.setDescription(
                            updatedHospital.getDescription()
                    );

                    existingHospital.setImageUrl(
                            updatedHospital.getImageUrl()
                    );

                    existingHospital.setState(
                            updatedHospital.getState()
                    );

                    existingHospital.setLatitude(
                            updatedHospital.getLatitude()
                    );

                    existingHospital.setLongitude(
                            updatedHospital.getLongitude()
                    );

                    // Administrator-priced fee: the uniqueness migration must never touch it.
                    existingHospital.setFeeAutoPriced(false);

                    Hospital savedHospital =
                            hospitalRepository.save(
                                    existingHospital
                            );

                    return ResponseEntity.ok(
                            savedHospital
                    );
                })
                .orElseGet(
                        () -> ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHospital(
            @PathVariable Long id
    ) {

        if (!hospitalRepository.existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        hospitalRepository.deleteById(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}