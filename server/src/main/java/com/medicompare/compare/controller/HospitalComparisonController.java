package com.medicompare.compare.controller;

import com.medicompare.compare.dto.CompareVerdictRequest;
import com.medicompare.compare.dto.CompareVerdictResponse;
import com.medicompare.compare.dto.HospitalComparisonResponse;
import com.medicompare.compare.service.CompareVerdictService;
import com.medicompare.compare.service.HospitalComparisonService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compare")
@CrossOrigin(origins = "*")
public class HospitalComparisonController {

    private final HospitalComparisonService comparisonService;
    private final CompareVerdictService verdictService;

    public HospitalComparisonController(
            HospitalComparisonService comparisonService,
            CompareVerdictService verdictService
    ) {
        this.comparisonService =
                comparisonService;
        this.verdictService =
                verdictService;
    }

    // =========================
    // COMPARE HOSPITALS
    // =========================

    @GetMapping("/hospitals")
    public ResponseEntity<?> compareHospitals(
            @RequestParam List<Long> hospitalIds
    ) {

        try {

            if (hospitalIds == null ||
                    hospitalIds.size() < 2 ||
                    hospitalIds.size() > 4) {

                return ResponseEntity.badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Select between 2 and 4 hospitals to compare."
                                )
                        );
            }

            List<HospitalComparisonResponse> result =
                    comparisonService.compareHospitals(
                            hospitalIds
                    );

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }

    // =========================
    // AI VERDICT
    // =========================

    @PostMapping("/ai-verdict")
    public ResponseEntity<?> aiVerdict(
            @RequestBody CompareVerdictRequest request
    ) {

        try {

            List<Long> hospitalIds =
                    request == null
                            ? null
                            : request.getHospitalIds();

            if (hospitalIds == null ||
                    hospitalIds.size() < 2 ||
                    hospitalIds.size() > 4) {

                return ResponseEntity.badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Select between 2 and 4 hospitals to compare."
                                )
                        );
            }

            CompareVerdictResponse verdict =
                    verdictService.verdict(hospitalIds);

            return ResponseEntity.ok(verdict);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }
}