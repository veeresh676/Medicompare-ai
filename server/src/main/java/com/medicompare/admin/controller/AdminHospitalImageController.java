package com.medicompare.admin.controller;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.image.HospitalImage;
import com.medicompare.image.HospitalImageRepository;
import com.medicompare.image.HospitalImageResponse;
import com.medicompare.service.FileStorageService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/hospitals/{hospitalId}/images")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHospitalImageController {

    private final HospitalImageRepository imageRepository;
    private final HospitalRepository hospitalRepository;
    private final FileStorageService fileStorageService;

    public AdminHospitalImageController(
            HospitalImageRepository imageRepository,
            HospitalRepository hospitalRepository,
            FileStorageService fileStorageService
    ) {
        this.imageRepository = imageRepository;
        this.hospitalRepository = hospitalRepository;
        this.fileStorageService = fileStorageService;
    }


    // =========================================================
    // GET ALL IMAGES
    // =========================================================

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<HospitalImageResponse>> getImages(
            @PathVariable Long hospitalId
    ) {

        if (!hospitalRepository.existsById(hospitalId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                imageRepository.findByHospitalId(hospitalId)
                        .stream()
                        .map(HospitalImageResponse::from)
                        .toList());
    }


    // =========================================================
    // UPLOAD IMAGE FILE
    // =========================================================

    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> uploadImage(
            @PathVariable Long hospitalId,

            @RequestParam("file")
            MultipartFile file,

            @RequestParam(
                    value = "altText",
                    required = false
            )
            String altText,

            @RequestParam(
                    value = "primaryImage",
                    defaultValue = "false"
            )
            boolean primaryImage
    ) {

        Hospital hospital =
                hospitalRepository
                        .findById(hospitalId)
                        .orElse(null);

        if (hospital == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }


        if (file == null || file.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Image file is required.");
        }


        try {

            // -------------------------------------------------
            // Store physical image
            // -------------------------------------------------

            String imageUrl =
                    fileStorageService
                            .storeHospitalImage(file);


            // -------------------------------------------------
            // If primary, remove primary flag from
            // all existing hospital images
            // -------------------------------------------------

            if (primaryImage) {

                List<HospitalImage> existingImages =
                        imageRepository
                                .findByHospitalId(
                                        hospitalId
                                );

                for (
                        HospitalImage existingImage :
                        existingImages
                ) {

                    existingImage
                            .setPrimaryImage(false);
                }

                imageRepository.saveAll(
                        existingImages
                );
            }


            // -------------------------------------------------
            // Create database record
            // -------------------------------------------------

            HospitalImage hospitalImage =
                    new HospitalImage();

            hospitalImage.setHospital(
                    hospital
            );

            hospitalImage.setImageUrl(
                    imageUrl
            );

            hospitalImage.setAltText(
                    altText != null
                            ? altText.trim()
                            : null
            );

            hospitalImage.setPrimaryImage(
                    primaryImage
            );


            HospitalImage savedImage =
                    imageRepository.save(
                            hospitalImage
                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(HospitalImageResponse.from(savedImage));


        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            exception.getMessage()
                    );


        } catch (IOException exception) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Unable to store the image."
                    );
        }
    }


    // =========================================================
    // SET PRIMARY IMAGE
    // =========================================================

    @PutMapping("/{imageId}/primary")
    public ResponseEntity<?> setPrimaryImage(
            @PathVariable Long hospitalId,
            @PathVariable Long imageId
    ) {

        HospitalImage selectedImage =
                imageRepository
                        .findById(imageId)
                        .orElse(null);


        if (selectedImage == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        if (
                selectedImage.getHospital() == null ||
                selectedImage.getHospital().getId() == null ||
                !selectedImage
                        .getHospital()
                        .getId()
                        .equals(hospitalId)
        ) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        // -------------------------------------------------
        // Remove primary status from all images
        // -------------------------------------------------

        List<HospitalImage> images =
                imageRepository
                        .findByHospitalId(
                                hospitalId
                        );


        for (
                HospitalImage image :
                images
        ) {

            image.setPrimaryImage(
                    image.getId()
                            .equals(imageId)
            );
        }


        imageRepository.saveAll(images);


        return ResponseEntity.ok(
                HospitalImageResponse.from(selectedImage));
    }


    // =========================================================
    // UPDATE IMAGE METADATA
    // =========================================================

    @PutMapping("/{imageId}")
    public ResponseEntity<?> updateImage(
            @PathVariable Long hospitalId,
            @PathVariable Long imageId,

            @RequestBody HospitalImage imageDetails
    ) {

        HospitalImage existingImage =
                imageRepository
                        .findById(imageId)
                        .orElse(null);


        if (existingImage == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        if (
                existingImage.getHospital() == null ||
                existingImage.getHospital().getId() == null ||
                !existingImage
                        .getHospital()
                        .getId()
                        .equals(hospitalId)
        ) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        /*
         * The image URL is intentionally NOT changed here.
         *
         * Images are managed through file uploads.
         * This prevents accidentally replacing the stored
         * file path with an arbitrary external URL.
         */

        existingImage.setAltText(
                imageDetails.getAltText()
        );


        if (
                imageDetails.isPrimaryImage()
        ) {

            List<HospitalImage> images =
                    imageRepository
                            .findByHospitalId(
                                    hospitalId
                            );

            for (
                    HospitalImage image :
                    images
            ) {

                image.setPrimaryImage(
                        image.getId()
                                .equals(imageId)
                );
            }

            imageRepository.saveAll(images);

        } else {

            existingImage.setPrimaryImage(
                    false
            );

            imageRepository.save(
                    existingImage
            );
        }


        return ResponseEntity.ok(
                HospitalImageResponse.from(existingImage));
    }


    // =========================================================
    // DELETE IMAGE
    // =========================================================

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long hospitalId,
            @PathVariable Long imageId
    ) {

        HospitalImage image =
                imageRepository
                        .findById(imageId)
                        .orElse(null);


        if (image == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        if (
                image.getHospital() == null ||
                image.getHospital().getId() == null ||
                !image
                        .getHospital()
                        .getId()
                        .equals(hospitalId)
        ) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        imageRepository.delete(image);


        return ResponseEntity
                .noContent()
                .build();
    }
}