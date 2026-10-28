package com.medicompare.compare.service;

import com.medicompare.compare.dto.HospitalComparisonResponse;
import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.review.repository.HospitalReviewRepository;
import com.medicompare.serviceentity.HospitalService;
import com.medicompare.serviceentity.HospitalServiceRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class HospitalComparisonService {

    private final HospitalRepository hospitalRepository;
    private final HospitalServiceRepository serviceRepository;
    private final HospitalReviewRepository reviewRepository;

    public HospitalComparisonService(
            HospitalRepository hospitalRepository,
            HospitalServiceRepository serviceRepository,
            HospitalReviewRepository reviewRepository
    ) {
        this.hospitalRepository = hospitalRepository;
        this.serviceRepository = serviceRepository;
        this.reviewRepository = reviewRepository;
    }

    // =========================
    // COMPARE HOSPITALS
    // =========================

    public List<HospitalComparisonResponse> compareHospitals(
            List<Long> hospitalIds
    ) {

        if (hospitalIds == null ||
                hospitalIds.size() < 2 ||
                hospitalIds.size() > 4) {

            throw new IllegalArgumentException(
                    "You must compare between 2 and 4 hospitals."
            );
        }

        List<Long> uniqueIds =
                hospitalIds.stream()
                        .distinct()
                        .toList();

        if (uniqueIds.size() != hospitalIds.size()) {

            throw new IllegalArgumentException(
                    "Duplicate hospitals are not allowed."
            );
        }

        List<HospitalComparisonResponse> result =
                new ArrayList<>();

        for (Long hospitalId : uniqueIds) {

            Hospital hospital =
                    hospitalRepository
                            .findById(hospitalId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Hospital not found: "
                                                    + hospitalId
                                    )
                            );

            HospitalComparisonResponse response =
                    new HospitalComparisonResponse();

            // =========================
            // HOSPITAL INFORMATION
            // =========================

            response.setHospitalId(
                    hospital.getId()
            );

            response.setHospitalName(
                    hospital.getName()
            );

            response.setCity(
                    hospital.getCity()
            );

            response.setAddress(
                    hospital.getAddress()
            );

            response.setPhoneNumber(
                    hospital.getPhoneNumber()
            );

            response.setRating(
                    hospital.getRating()
            );

            response.setConsultationFee(
                    hospital.getConsultationFee()
            );

            response.setHospitalType(
                    hospital.getHospitalType()
            );

            response.setImageUrl(
                    hospital.getImageUrl()
            );

            // =========================
            // REAL PATIENT REVIEWS
            // =========================

            Double reviewAverage =
                    reviewRepository.getAverageRating(
                            hospitalId
                    );

            long reviewCount =
                    reviewRepository.getReviewCount(
                            hospitalId
                    );

            response.setReviewAverage(
                    reviewAverage != null && reviewAverage > 0
                            ? reviewAverage
                            : null
            );

            response.setReviewCount(
                    reviewCount
            );

            // =========================
            // SERVICES
            // =========================

            List<HospitalService> services =
                    serviceRepository
                            .findAvailableByHospitalId(
                                    hospitalId
                            );

            List<HospitalComparisonResponse.ServiceComparisonItem>
                    serviceItems =
                    services.stream()
                            .map(this::mapService)
                            .toList();

            response.setServices(
                    serviceItems
            );

            result.add(response);
        }

        return result;
    }

    // =========================
    // MAP SERVICE
    // =========================

    private HospitalComparisonResponse.ServiceComparisonItem
    mapService(
            HospitalService service
    ) {

        HospitalComparisonResponse.ServiceComparisonItem item =
                new HospitalComparisonResponse.ServiceComparisonItem();

        item.setServiceId(
                service.getId()
        );

        item.setName(
                service.getName()
        );

        item.setCategory(
                service.getCategory()
        );

        item.setDescription(
                service.getDescription()
        );

        item.setPrice(
                service.getPrice()
        );

        item.setDurationMinutes(
                service.getDurationMinutes()
        );

        item.setAvailable(
                service.getAvailable()
        );

        return item;
    }
}