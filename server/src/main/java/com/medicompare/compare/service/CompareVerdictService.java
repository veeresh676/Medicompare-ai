package com.medicompare.compare.service;

import com.medicompare.ai.service.AiChatService;
import com.medicompare.compare.dto.CompareVerdictResponse;
import com.medicompare.compare.dto.HospitalComparisonResponse;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * Powers the flagship "AI Recommendation" verdict on the comparison page.
 *
 * Every compared hospital is scored 0-100 with prices, ratings and real
 * patient-review signals weighed RELATIVE to the compared set
 * (cheapest of the set wins price points, highest rated wins quality).
 *
 * The winner, scores and factual reasons are always computed
 * deterministically. The free-text explanation additionally goes
 * through the LLM with strict grounding rules; if the AI service is
 * unavailable the endpoint still succeeds with the deterministic
 * explanation (aiAvailable=false).
 */
@Service
public class CompareVerdictService {

    private final HospitalComparisonService comparisonService;
    private final AiChatService aiChatService;

    public CompareVerdictService(
            HospitalComparisonService comparisonService,
            AiChatService aiChatService
    ) {
        this.comparisonService = comparisonService;
        this.aiChatService = aiChatService;
    }

    public CompareVerdictResponse verdict(
            List<Long> hospitalIds
    ) {

        List<HospitalComparisonResponse> hospitals =
                comparisonService.compareHospitals(hospitalIds);

        List<Scored> scored = scoreAll(hospitals);

        scored.sort(
                Comparator.comparingDouble(Scored::score).reversed());

        Scored winner = scored.get(0);

        List<String> reasons = winnerReasons(winner, scored);

        CompareVerdictResponse response =
                new CompareVerdictResponse();

        response.setWinnerHospitalId(
                winner.hospital().getHospitalId());
        response.setWinnerHospitalName(
                winner.hospital().getHospitalName());
        response.setScores(
                scored.stream()
                        .map(entry -> new CompareVerdictResponse.HospitalScore(
                                entry.hospital().getHospitalId(),
                                entry.hospital().getHospitalName(),
                                entry.score(),
                                level(entry.score())))
                        .toList());
        response.setWinnerReasons(reasons);

        try {
            response.setExplanation(
                    aiChatService.chat(buildPrompt(scored)));
            response.setAiAvailable(true);
        } catch (Exception e) {
            response.setExplanation(fallbackExplanation(winner, reasons));
            response.setAiAvailable(false);
        }

        return response;
    }

    private record Scored(
            HospitalComparisonResponse hospital,
            double score,
            double quality,
            double costIndex) {
    }

    private List<Scored> scoreAll(
            List<HospitalComparisonResponse> hospitals
    ) {

        double minCost = hospitals.stream()
                .mapToDouble(this::costIndex)
                .filter(value -> value > 0)
                .min()
                .orElse(0);

        long maxServices = hospitals.stream()
                .mapToLong(hospital -> hospital.getServices() == null
                        ? 0
                        : hospital.getServices().stream()
                                .filter(service ->
                                        service.getAvailable() == null
                                                || service.getAvailable())
                                .count())
                .max()
                .orElse(0);

        List<Scored> result = new ArrayList<>();

        for (HospitalComparisonResponse hospital : hospitals) {

            /*
             * QUALITY — 40 points.
             * Blends the platform rating with real user reviews;
             * reviews progressively outweigh the stored rating.
             */
            double base = hospital.getRating() == null
                    ? 3.0 : hospital.getRating();
            long reviewCount = hospital.getReviewCount() == null
                    ? 0 : hospital.getReviewCount();
            double reviewAvg = hospital.getReviewAverage() == null
                    || hospital.getReviewAverage() <= 0
                    ? base : hospital.getReviewAverage();
            double confidence = Math.min(reviewCount / 20.0, 1.0);
            double blended = base * (1.0 - confidence)
                    + reviewAvg * confidence;
            double quality = clamp(blended / 5.0, 0, 1) * 40.0;

            /*
             * PRICE — 35 points, relative to the compared set.
             */
            double cost = costIndex(hospital);
            double price = cost <= 0 || minCost <= 0
                    ? 17.5
                    : 35.0 * (minCost / cost);

            /*
             * BREADTH — 15 points for available service coverage.
             */
            long available = hospital.getServices() == null
                    ? 0
                    : hospital.getServices().stream()
                            .filter(service ->
                                    service.getAvailable() == null
                                            || service.getAvailable())
                            .count();
            double breadth = maxServices <= 0
                    ? 7.5
                    : 15.0 * ((double) available / maxServices);

            /*
             * REVIEW EVIDENCE — 10 points for real patient signals.
             */
            double evidence = 10.0 * Math.min(reviewCount / 20.0, 1.0);

            double total = Math.min(
                    Math.round((quality + price + breadth + evidence) * 100.0) / 100.0,
                    100.0);

            result.add(new Scored(hospital, total, quality, cost));
        }

        return result;
    }

    private double costIndex(
            HospitalComparisonResponse hospital
    ) {

        double fee = hospital.getConsultationFee() == null
                ? 0 : hospital.getConsultationFee();

        double serviceAvg = 0;
        int serviceCount = 0;

        if (hospital.getServices() != null) {
            for (HospitalComparisonResponse.ServiceComparisonItem service
                    : hospital.getServices()) {
                BigDecimal price = service.getPrice();
                if (price != null && price.doubleValue() > 0) {
                    serviceAvg += price.doubleValue();
                    serviceCount++;
                }
            }
        }

        if (serviceCount > 0) {
            serviceAvg /= serviceCount;
        }

        if (fee <= 0 && serviceAvg <= 0) {
            return 0;
        }

        if (fee <= 0) {
            return serviceAvg;
        }

        if (serviceAvg <= 0) {
            return fee;
        }

        return fee * 0.4 + serviceAvg * 0.6;
    }

    private List<String> winnerReasons(
            Scored winner,
            List<Scored> all
    ) {

        List<String> reasons = new ArrayList<>();
        HospitalComparisonResponse w = winner.hospital();

        Double lowestFee = all.stream()
                .map(entry -> entry.hospital().getConsultationFee())
                .filter(value -> value != null)
                .min(Double::compareTo)
                .orElse(null);

        if (lowestFee != null
                && w.getConsultationFee() != null
                && w.getConsultationFee() <= lowestFee) {
            reasons.add(String.format(Locale.US,
                    "Lowest consultation fee in this comparison (₹%.0f).",
                    w.getConsultationFee()));
        }

        double winnerQuality = blendedRating(w);
        boolean topRated = all.stream().allMatch(
                entry -> blendedRating(entry.hospital()) <= winnerQuality + 1e-9);
        if (topRated) {
            reasons.add(String.format(Locale.US,
                    "Highest overall rating in this comparison (%.1f/5).",
                    winnerQuality));
        }

        long winnerReviews = w.getReviewCount() == null
                ? 0 : w.getReviewCount();
        boolean mostReviewed = all.stream().allMatch(
                entry -> (entry.hospital().getReviewCount() == null
                        ? 0 : entry.hospital().getReviewCount()) <= winnerReviews);
        if (winnerReviews > 0 && mostReviewed) {
            reasons.add(String.format(Locale.US,
                    "Most patient reviews in this comparison (%d).",
                    winnerReviews));
        } else if (winnerReviews > 0) {
            reasons.add(String.format(Locale.US,
                    "Backed by %d real patient review%s.",
                    winnerReviews, winnerReviews == 1 ? "" : "s"));
        } else {
            reasons.add("Strong platform rating (patient reviews pending).");
        }

        long winnerServices = availableCount(w);
        boolean widest = all.stream().allMatch(
                entry -> availableCount(entry.hospital()) <= winnerServices);
        if (widest && winnerServices > 0) {
            reasons.add(String.format(Locale.US,
                    "Widest service coverage here (%d available services).",
                    winnerServices));
        }

        double winnerAvgPrice = averageServicePrice(w);
        Double cheapestAvg = all.stream()
                .map(entry -> averageServicePrice(entry.hospital()))
                .filter(value -> value > 0)
                .min(Double::compareTo)
                .orElse(0.0);
        if (winnerAvgPrice > 0 && winnerAvgPrice <= cheapestAvg) {
            reasons.add("Lowest average service pricing in this comparison.");
        }

        return reasons;
    }

    private double blendedRating(
            HospitalComparisonResponse hospital
    ) {
        double base = hospital.getRating() == null
                ? 3.0 : hospital.getRating();
        long count = hospital.getReviewCount() == null
                ? 0 : hospital.getReviewCount();
        double avg = hospital.getReviewAverage() == null
                || hospital.getReviewAverage() <= 0
                ? base : hospital.getReviewAverage();
        double confidence = Math.min(count / 20.0, 1.0);
        return base * (1.0 - confidence) + avg * confidence;
    }

    private long availableCount(
            HospitalComparisonResponse hospital
    ) {
        if (hospital.getServices() == null) {
            return 0;
        }
        return hospital.getServices().stream()
                .filter(service -> service.getAvailable() == null
                        || service.getAvailable())
                .count();
    }

    private double averageServicePrice(
            HospitalComparisonResponse hospital
    ) {
        if (hospital.getServices() == null) {
            return 0;
        }
        double sum = 0;
        int count = 0;
        for (HospitalComparisonResponse.ServiceComparisonItem service
                : hospital.getServices()) {
            if (service.getPrice() != null
                    && service.getPrice().doubleValue() > 0) {
                sum += service.getPrice().doubleValue();
                count++;
            }
        }
        return count == 0 ? 0 : sum / count;
    }

    private String level(double score) {
        if (score >= 85) {
            return "HIGHLY_RECOMMENDED";
        }
        if (score >= 70) {
            return "RECOMMENDED";
        }
        if (score >= 55) {
            return "GOOD_OPTION";
        }
        return "ALTERNATIVE";
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private String fallbackExplanation(
            Scored winner,
            List<String> reasons
    ) {
        StringBuilder text = new StringBuilder();
        text.append("Based on prices, ratings and patient reviews, ")
                .append(winner.hospital().getHospitalName())
                .append(String.format(Locale.US,
                        " leads this comparison with a score of %.1f/100.\n\n",
                        winner.score()));
        for (String reason : reasons) {
            text.append("- ").append(reason).append("\n");
        }
        text.append("\nScores reflect the hospitals you selected and are not a medical recommendation.");
        return text.toString();
    }

    private String buildPrompt(List<Scored> scored) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are the verdict component of MediCompare's hospital comparison page.

                The hospitals below were scored by MediCompare's deterministic engine
                (prices, ratings and real patient reviews, weighed relative to this set).
                The ranking is FINAL — do not re-rank or contradict it.

                STRICT RULES:
                - Use ONLY the data provided below. Never invent prices, ratings,
                  reviews, services, availability or medical facts.
                - Distinguish real patient-review data from platform ratings.
                - If a hospital has no patient reviews, say so plainly.
                - Never claim medical superiority; this is a price/rating/review comparison.
                - Keep it short: announce the winner in one line, then 2-4 bullets on
                  why it leads (price, rating, reviews, breadth) plus one trade-off.
                - Plain text with simple bullets (-). No headings, no intro fluff.
                - End with one line: scores reflect the selected hospitals and are not medical advice.
                """);

        prompt.append("\nSCORED HOSPITALS (rank order):\n");

        int rank = 1;
        for (Scored entry : scored) {
            HospitalComparisonResponse h = entry.hospital();
            long reviews = h.getReviewCount() == null ? 0 : h.getReviewCount();

            prompt.append(String.format(Locale.US,
                    "\n#%d %s (%s) — score %.1f/100\n",
                    rank++, h.getHospitalName(),
                    h.getCity() == null ? "?" : h.getCity(),
                    entry.score()));
            prompt.append("- Platform rating: ")
                    .append(h.getRating() == null ? "n/a"
                            : String.format(Locale.US, "%.1f/5", h.getRating()))
                    .append("\n");
            prompt.append("- Patient reviews: ")
                    .append(reviews == 0 ? "none yet"
                            : String.format(Locale.US, "%d reviews, avg %.1f/5",
                                    reviews,
                                    h.getReviewAverage() == null ? 0 : h.getReviewAverage()))
                    .append("\n");
            prompt.append("- Consultation fee: ")
                    .append(h.getConsultationFee() == null ? "n/a"
                            : String.format(Locale.US, "Rs.%.0f", h.getConsultationFee()))
                    .append("\n");
            prompt.append(String.format(Locale.US,
                    "- Avg service price: Rs.%.0f across %d available services\n",
                    averageServicePrice(h), availableCount(h)));
        }

        return prompt.toString();
    }
}
