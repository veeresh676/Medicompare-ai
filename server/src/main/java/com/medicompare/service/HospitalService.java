package com.medicompare.service;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.specification.HospitalSpecification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(
            HospitalRepository hospitalRepository
    ) {
        this.hospitalRepository =
                hospitalRepository;
    }


    // =========================================================
    // SEARCH
    // =========================================================

    public Page<Hospital> searchHospitals(
            String search,
            String city,
            String state,
            String hospitalType,
            Double minRating,
            Double maxFee,
            Pageable pageable
    ) {

        return hospitalRepository.findAll(
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
    }

    /** Backwards-compatible overload (no state filter). */
    public Page<Hospital> searchHospitals(
            String search,
            String city,
            String hospitalType,
            Double minRating,
            Double maxFee,
            Pageable pageable
    ) {
        return searchHospitals(
                search, city, null, hospitalType,
                minRating, maxFee, pageable
        );
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    public Hospital getHospitalById(
            Long id
    ) {

        return hospitalRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Hospital not found with id: "
                                        + id
                        )
                );
    }


    // =========================================================
    // CREATE
    // =========================================================

    public Hospital createHospital(
            Hospital hospital
    ) {

        hospital.setId(null);

        // Explicitly saved fee: the uniqueness migration must never touch it.
        hospital.setFeeAutoPriced(false);

        return hospitalRepository.save(
                hospital
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    public Hospital updateHospital(
            Long id,
            Hospital hospitalDetails
    ) {

        Hospital hospital =
                getHospitalById(id);

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

        return hospitalRepository.save(
                hospital
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    public void deleteHospital(
            Long id
    ) {

        if (!hospitalRepository.existsById(id)) {

            throw new RuntimeException(
                    "Hospital not found with id: "
                          + id
            );
        }

        hospitalRepository.deleteById(id);
    }
}