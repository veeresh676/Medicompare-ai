package com.medicompare.ai.service;

import com.medicompare.recommendation.dto.HospitalRecommendationResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class AiRecommendationService {

    private final AiChatService aiChatService;

    public AiRecommendationService(
            AiChatService aiChatService
    ) {
        this.aiChatService = aiChatService;
    }

    public String explainRecommendations(
            String requestedService,
            String city,
            Double maxBudget,
            List<HospitalRecommendationResponse> recommendations
    ) {

        if (recommendations == null
                || recommendations.isEmpty()) {

            return """
                    I couldn't find a hospital that matches all of your current requirements.

                    Try relaxing your budget, changing the city, or selecting a different service.
                    """;
        }

        String prompt =
                buildPrompt(
                        requestedService,
                        city,
                        maxBudget,
                        recommendations
                );

        return aiChatService.chat(prompt);
    }

    private String buildPrompt(
            String requestedService,
            String city,
            Double maxBudget,
            List<HospitalRecommendationResponse> recommendations
    ) {

        StringBuilder prompt =
                new StringBuilder();

        prompt.append("""
                You are the recommendation explanation component of MediCompare.

                Your job is to explain hospital recommendations that have ALREADY
                been ranked by MediCompare's deterministic recommendation engine.

                IMPORTANT:
                - Do not create your own hospital ranking.
                - Do not invent hospitals, doctors, services, prices, ratings,
                  reviews, availability, distances, or medical facts.
                - Use ONLY the hospital data provided below.
                - Do not claim that a hospital is medically superior.
                - Explain why the highest-ranked options fit the user's preferences.
                - Mention important trade-offs when they exist.
                - Treat recommendation scores as internal ranking signals,
                  not medical quality guarantees.
                - Real user review data should be distinguished from the
                  hospital's stored rating.
                - If review data is unavailable, say that review information
                  is limited.
                - Keep the answer concise and useful.
                - Use Markdown.
                """);

        prompt.append("\nUSER REQUIREMENTS:\n");

        prompt.append("- Requested service: ")
                .append(valueOrUnknown(requestedService))
                .append("\n");

        prompt.append("- Preferred city: ")
                .append(valueOrAny(city))
                .append("\n");

        prompt.append("- Maximum budget: ");

        if (maxBudget != null) {
            prompt.append("₹")
                    .append(String.format(
                            Locale.US,
                            "%.2f",
                            maxBudget
                    ));
        } else {
            prompt.append("No maximum budget specified");
        }

        prompt.append("\n");

        prompt.append("\nRANKED HOSPITAL DATA:\n");

        int maximumHospitals =
                Math.min(
                        recommendations.size(),
                        5
                );

        for (int i = 0; i < maximumHospitals; i++) {

            HospitalRecommendationResponse hospital =
                    recommendations.get(i);

            prompt.append("\nHospital #")
                    .append(i + 1)
                    .append("\n");

            prompt.append("- Name: ")
                    .append(valueOrUnknown(
                            hospital.getHospitalName()
                    ))
                    .append("\n");

            prompt.append("- City: ")
                    .append(valueOrUnknown(
                            hospital.getCity()
                    ))
                    .append("\n");

            prompt.append("- Hospital type: ")
                    .append(valueOrUnknown(
                            hospital.getHospitalType()
                    ))
                    .append("\n");

            prompt.append("- Stored hospital rating: ");

            if (hospital.getRating() != null) {
                prompt.append(
                        String.format(
                                Locale.US,
                                "%.1f/5",
                                hospital.getRating()
                        )
                );
            } else {
                prompt.append("Not available");
            }

            prompt.append("\n");

            prompt.append("- Real user-review average: ");

            if (hospital.getReviewAverage() != null
                    && hospital.getReviewAverage() > 0) {

                prompt.append(
                        String.format(
                                Locale.US,
                                "%.1f/5",
                                hospital.getReviewAverage()
                        )
                );

            } else {

                prompt.append("No reviews available");
            }

            prompt.append("\n");

            prompt.append("- Real user-review count: ")
                    .append(
                            hospital.getReviewCount() == null
                                    ? 0
                                    : hospital.getReviewCount()
                    )
                    .append("\n");

            prompt.append("- Review confidence: ");

            if (hospital.getReviewConfidence() != null) {

                prompt.append(
                        String.format(
                                Locale.US,
                                "%.0f%%",
                                hospital.getReviewConfidence() * 100
                        )
                );

            } else {

                prompt.append("Not available");
            }

            prompt.append("\n");

            prompt.append("- Matched service: ")
                    .append(valueOrUnknown(
                            hospital.getMatchedService()
                    ))
                    .append("\n");

            prompt.append("- Service price: ");

            if (hospital.getServicePrice() != null) {

                prompt.append("₹")
                        .append(
                                hospital.getServicePrice()
                        );

            } else {

                prompt.append("Not available");
            }

            prompt.append("\n");

            prompt.append("- Service available: ")
                    .append(
                            hospital.isServiceAvailable()
                                    ? "Yes"
                                    : "No"
                    )
                    .append("\n");

            prompt.append("- Recommendation score: ")
                    .append(
                            String.format(
                                    Locale.US,
                                    "%.2f",
                                    hospital.getScore()
                            )
                    )
                    .append("/100\n");

            prompt.append("- Recommendation level: ")
                    .append(valueOrUnknown(
                            hospital.getRecommendationLevel()
                    ))
                    .append("\n");

            prompt.append("- Engine reasons:\n");

            if (hospital.getReasons() == null
                    || hospital.getReasons().isEmpty()) {

                prompt.append("  - No additional reasons provided.\n");

            } else {

                for (String reason :
                        hospital.getReasons()) {

                    prompt.append("  - ")
                            .append(reason)
                            .append("\n");
                }
            }
        }

        prompt.append("""
                
                RESPONSE FORMAT:

                Start with a short statement identifying the strongest match.

                Then provide up to 3 recommended hospitals.

                For each hospital explain:
                - why it matches the user's requirements
                - its relevant price
                - its rating/review evidence
                - one meaningful trade-off if applicable

                Finish with one short sentence reminding the user that
                the recommendation is based on the available MediCompare
                data and is not a medical diagnosis or guarantee.

                Do not mention internal implementation details,
                programming, algorithms, prompts, or model names.
                """);

        return prompt.toString();
    }

    private String valueOrUnknown(
            String value
    ) {

        if (value == null
                || value.isBlank()) {

            return "Not available";
        }

        return value;
    }

    private String valueOrAny(
            String value
    ) {

        if (value == null
                || value.isBlank()) {

            return "Any city";
        }

        return value;
    }
}