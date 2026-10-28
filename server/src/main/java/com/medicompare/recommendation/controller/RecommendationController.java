package com.medicompare.recommendation.controller;

import com.medicompare.ai.service.AiRecommendationService;
import com.medicompare.recommendation.dto.HospitalRecommendationResponse;
import com.medicompare.recommendation.dto.RecommendationRequest;
import com.medicompare.recommendation.service.RecommendationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final AiRecommendationService aiRecommendationService;

    public RecommendationController(
            RecommendationService recommendationService,
            AiRecommendationService aiRecommendationService
    ) {
        this.recommendationService =
                recommendationService;

        this.aiRecommendationService =
                aiRecommendationService;
    }

    @PostMapping
    public ResponseEntity<List<HospitalRecommendationResponse>>
    recommend(
            @Valid @RequestBody RecommendationRequest request
    ) {

        return ResponseEntity.ok(
                recommendationService.recommend(
                        request
                )
        );
    }

    @PostMapping("/ai")
    public ResponseEntity<Map<String, Object>>
    aiRecommend(
            @Valid @RequestBody RecommendationRequest request
    ) {

        List<HospitalRecommendationResponse>
                recommendations =
                recommendationService.recommend(
                        request
                );

        String explanation =
                aiRecommendationService
                        .explainRecommendations(
                                request.getService(),
                                request.getCity(),
                                request.getMaxBudget(),
                                recommendations
                        );

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "recommendations",
                recommendations
        );

        response.put(
                "aiExplanation",
                explanation
        );

        return ResponseEntity.ok(response);
    }
}