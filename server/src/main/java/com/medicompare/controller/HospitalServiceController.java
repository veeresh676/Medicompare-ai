package com.medicompare.controller;

import com.medicompare.repository.HospitalRepository;
import com.medicompare.serviceentity.HospitalServiceRepository;
import com.medicompare.serviceentity.HospitalServiceResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalServiceController {

    private final HospitalRepository hospitalRepository;
    private final HospitalServiceRepository hospitalServiceRepository;

    public HospitalServiceController(
            HospitalRepository hospitalRepository,
            HospitalServiceRepository hospitalServiceRepository
    ) {
        this.hospitalRepository = hospitalRepository;
        this.hospitalServiceRepository = hospitalServiceRepository;
    }

    @GetMapping("/{hospitalId}/services")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getHospitalServices(
            @PathVariable Long hospitalId
    ) {

        if (!hospitalRepository.existsById(hospitalId)) {
            return ResponseEntity.notFound().build();
        }

        List<HospitalServiceResponse> services =
                hospitalServiceRepository.findAvailableByHospitalId(
                        hospitalId
                )
                        .stream()
                        .map(HospitalServiceResponse::from)
                        .toList();

        return ResponseEntity.ok(services);
    }
}