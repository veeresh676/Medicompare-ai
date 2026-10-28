package com.medicompare.controller;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.specification.HospitalSpecification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin(origins = "*")
public class HospitalController {

    private final HospitalRepository hospitalRepository;

    public HospitalController(
            HospitalRepository hospitalRepository
    ) {
        this.hospitalRepository = hospitalRepository;
    }


    // =========================================================
    // SEARCH / FILTER HOSPITALS
    // =========================================================

    @GetMapping
    public ResponseEntity<Page<Hospital>> searchHospitals(

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            String city,

            @RequestParam(required = false)
            String state,

            @RequestParam(required = false)
            String hospitalType,

            @RequestParam(required = false)
            Double minRating,

            @RequestParam(required = false)
            Double maxFee,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "rating")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction
    ) {

        Sort.Direction sortDirection =
                direction.equalsIgnoreCase("asc")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

       // Sort by the selected field and use hospital ID as a tie-breaker.
Sort sort = Sort.by(
        new Sort.Order(sortDirection, sortBy),
        new Sort.Order(Sort.Direction.ASC, "id")
);

Pageable pageable = PageRequest.of(
        page,
        size,
        sort
);

        Page<Hospital> hospitals =
                hospitalRepository.findAll(
                        HospitalSpecification.filter(
                                search,
                                city,
                                state,
                                hospitalType,
                                minRating,
                                maxFee
                        ),
                        pageable
                );

        return ResponseEntity.ok(hospitals);
    }


    // =========================================================
    // NEARBY HOSPITALS (Haversine, km)
    // GET /api/hospitals/nearby?lat=17.38&lng=78.48&radiusKm=25&state=Telangana&limit=50
    // =========================================================

    @GetMapping("/nearby")
    public ResponseEntity<?> nearbyHospitals(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "25") Double radiusKm,
            @RequestParam(required = false) String state,
            @RequestParam(defaultValue = "50") int limit
    ) {

        if (lat == null || lng == null) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of(
                            "message", "lat and lng query params are required"
                    ));
        }

        java.util.List<Hospital> all =
                hospitalRepository.findAll();

        java.util.List<java.util.Map<String, Object>> results =
                new java.util.ArrayList<>();

        for (Hospital hospital : all) {

            if (hospital.getLatitude() == null
                    || hospital.getLongitude() == null) {
                continue;
            }

            if (state != null && !state.isBlank()
                    && hospital.getState() != null
                    && !hospital.getState().equalsIgnoreCase(state.trim())) {
                continue;
            }

            double distanceKm = haversineKm(
                    lat, lng,
                    hospital.getLatitude(),
                    hospital.getLongitude()
            );

            if (distanceKm <= radiusKm) {
                java.util.Map<String, Object> entry =
                        new java.util.LinkedHashMap<>();
                entry.put("hospital", hospital);
                entry.put("distanceKm",
                        Math.round(distanceKm * 10.0) / 10.0);
                results.add(entry);
            }
        }

        results.sort(java.util.Comparator.comparingDouble(
                entry -> ((Number) entry.get("distanceKm")).doubleValue()
        ));

        if (results.size() > limit) {
            results = results.subList(0, limit);
        }

        return ResponseEntity.ok(results);
    }


    // =========================================================
    // DISTINCT STATES + CITIES (for filters)
    // =========================================================

    @GetMapping("/meta/states")
    public ResponseEntity<java.util.List<String>> distinctStates() {

        java.util.List<String> states =
                hospitalRepository.findAll().stream()
                        .map(Hospital::getState)
                        .filter(value -> value != null && !value.isBlank())
                        .map(String::trim)
                        .distinct()
                        .sorted(String.CASE_INSENSITIVE_ORDER)
                        .toList();

        return ResponseEntity.ok(states);
    }

    @GetMapping("/meta/cities")
    public ResponseEntity<java.util.List<String>> distinctCities(
            @RequestParam(required = false) String state
    ) {

        java.util.List<String> cities =
                hospitalRepository.findAll().stream()
                        .filter(hospital -> state == null
                                || state.isBlank()
                                || (hospital.getState() != null
                                && hospital.getState().equalsIgnoreCase(state.trim())))
                        .map(Hospital::getCity)
                        .filter(value -> value != null && !value.isBlank())
                        .map(String::trim)
                        .distinct()
                        .sorted(String.CASE_INSENSITIVE_ORDER)
                        .toList();

        return ResponseEntity.ok(cities);
    }

    private double haversineKm(
            double lat1, double lng1,
            double lat2, double lng2
    ) {
        final double earthRadiusKm = 6371.0;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadiusKm * c;
    }


    // =========================================================
    // GET HOSPITAL
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospitalById(
            @PathVariable Long id
    ) {

        return hospitalRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }


    // =========================================================
    // CREATE HOSPITAL
    // =========================================================

    @PostMapping
    public ResponseEntity<Hospital> createHospital(
            @RequestBody Hospital hospital
    ) {

        hospital.setId(null);

        // Explicitly saved fee: the uniqueness migration must never touch it.
        hospital.setFeeAutoPriced(false);

        Hospital savedHospital =
                hospitalRepository.save(hospital);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedHospital);
    }


    // =========================================================
    // UPDATE HOSPITAL
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Hospital> updateHospital(
            @PathVariable Long id,
            @RequestBody Hospital hospitalDetails
    ) {

        return hospitalRepository.findById(id)
                .map(hospital -> {

                    hospital.setName(
                            hospitalDetails.getName()
                    );

                    hospital.setCity(
                            hospitalDetails.getCity()
                    );

                    hospital.setAddress(
                            hospitalDetails.getAddress()
                    );

                    hospital.setPhoneNumber(
                            hospitalDetails.getPhoneNumber()
                    );

                    hospital.setRating(
                            hospitalDetails.getRating()
                    );

                    hospital.setConsultationFee(
                            hospitalDetails
                                    .getConsultationFee()
                    );

                    hospital.setLocation(
                            hospitalDetails.getLocation()
                    );

                    hospital.setHospitalType(
                            hospitalDetails
                                    .getHospitalType()
                    );

                    hospital.setDescription(
                            hospitalDetails
                                    .getDescription()
                    );

                    hospital.setImageUrl(
                            hospitalDetails
                                    .getImageUrl()
                    );

                    hospital.setState(
                            hospitalDetails.getState()
                    );

                    hospital.setLatitude(
                            hospitalDetails.getLatitude()
                    );

                    hospital.setLongitude(
                            hospitalDetails.getLongitude()
                    );

                    // Explicitly saved fee: the uniqueness migration must never touch it.
                    hospital.setFeeAutoPriced(false);

                    return ResponseEntity.ok(
                            hospitalRepository.save(
                                    hospital
                            )
                    );
                })
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }


    // =========================================================
    // DELETE HOSPITAL
    // =========================================================

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