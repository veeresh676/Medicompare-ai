package com.medicompare.admin.controller;

import com.medicompare.image.ImageValidationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Lets an administrator verify hospital image health at any time.
 *
 * GET /api/admin/images/validate              -> report only
 * GET /api/admin/images/validate?repair=true  -> report + auto-repair
 *                                                broken URLs with unused
 *                                                photos from the shared pool
 */
@RestController
@RequestMapping("/api/admin/images")
@CrossOrigin(origins = "*")
public class AdminImageMaintenanceController {

    private final ImageValidationService imageValidationService;

    public AdminImageMaintenanceController(
            ImageValidationService imageValidationService
    ) {
        this.imageValidationService = imageValidationService;
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateImages(
            @RequestParam(defaultValue = "false") boolean repair
    ) {
        return ResponseEntity.ok(
                imageValidationService.validateAll(repair));
    }
}
