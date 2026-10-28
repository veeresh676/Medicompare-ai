package com.medicompare.controller;

import com.medicompare.image.HospitalImage;
import com.medicompare.image.HospitalImageRepository;
import com.medicompare.repository.HospitalRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin(origins = "*")
public class HospitalImageController {

    private final HospitalRepository hospitalRepository;
    private final HospitalImageRepository imageRepository;

    public HospitalImageController(
            HospitalRepository hospitalRepository,
            HospitalImageRepository imageRepository
    ) {
        this.hospitalRepository = hospitalRepository;
        this.imageRepository = imageRepository;
    }


    // =========================================================
    // GET ALL PUBLIC IMAGES
    // =========================================================

    @GetMapping("/{hospitalId}/images")
    public ResponseEntity<List<Map<String, Object>>> getHospitalImages(
            @PathVariable Long hospitalId
    ) {

        if (!hospitalRepository.existsById(hospitalId)) {
            return ResponseEntity.notFound().build();
        }

        List<Map<String, Object>> images =
                imageRepository.findByHospitalId(hospitalId)
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(images);
    }


    // =========================================================
    // GET PRIMARY IMAGE
    // =========================================================

    @GetMapping("/{hospitalId}/images/primary")
    public ResponseEntity<Map<String, Object>> getPrimaryImage(
            @PathVariable Long hospitalId
    ) {

        if (!hospitalRepository.existsById(hospitalId)) {
            return ResponseEntity.notFound().build();
        }

        return imageRepository
                .findByHospitalIdAndPrimaryImageTrue(hospitalId)
                .stream()
                .findFirst()
                .map(image ->
                        ResponseEntity.ok(toResponse(image))
                )
                .orElseGet(
                        () -> ResponseEntity.noContent().build()
                );
    }


    // =========================================================
    // SAFE IMAGE RESPONSE
    // =========================================================

    private Map<String, Object> toResponse(
            HospitalImage image
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                image.getId()
        );

        response.put(
                "imageUrl",
                image.getImageUrl()
        );

        response.put(
                "title",
                image.getTitle()
        );

        response.put(
                "description",
                image.getDescription()
        );

        response.put(
                "altText",
                image.getAltText()
        );

        response.put(
                "primaryImage",
                image.isPrimaryImage()
        );

        return response;
    }
}