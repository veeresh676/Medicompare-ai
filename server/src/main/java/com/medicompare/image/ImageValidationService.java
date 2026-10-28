package com.medicompare.image;

import com.medicompare.config.HospitalRealImageInitializer;
import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * Checks every hospital's remote image URL and, on request, repairs
 * broken ones with an unused photo from the shared real-image pool.
 *
 * Used by the admin validate endpoint so image health can be verified
 * at any time in the future — images keep loading correctly even if a
 * remote file is moved or deleted years from now.
 */
@Service
public class ImageValidationService {

    private static final int TIMEOUT_MS = 8000;
    private static final int THREADS = 10;

    private final HospitalRepository hospitalRepository;

    public ImageValidationService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public Map<String, Object> validateAll(boolean repair) {

        List<Hospital> hospitals = hospitalRepository.findAll(
                Sort.by(Sort.Direction.ASC, "id"));

        ExecutorService executor = Executors.newFixedThreadPool(THREADS);

        try {
            List<Future<Map<String, Object>>> futures = new ArrayList<>();

            for (Hospital hospital : hospitals) {
                final Long id = hospital.getId();
                final String url = hospital.getImageUrl();

                Callable<Map<String, Object>> task = () -> {
                    Map<String, Object> result = new LinkedHashMap<>();
                    result.put("hospitalId", id);
                    result.put("name", hospital.getName());
                    result.put("city", hospital.getCity());
                    result.put("imageUrl", url);

                    if (url == null || url.isBlank()) {
                        result.put("status", "MISSING");
                        return result;
                    }

                    if (!url.startsWith("http")) {
                        // Local admin upload — served by this backend.
                        result.put("status", "LOCAL");
                        return result;
                    }

                    result.put("status", checkUrl(url) ? "OK" : "BROKEN");
                    return result;
                };

                futures.add(executor.submit(task));
            }

            List<Map<String, Object>> checked = new ArrayList<>();
            for (Future<Map<String, Object>> future : futures) {
                try {
                    checked.add(future.get(TIMEOUT_MS + 5000, TimeUnit.MILLISECONDS));
                } catch (Exception e) {
                    Map<String, Object> unknown = new LinkedHashMap<>();
                    unknown.put("status", "UNKNOWN");
                    unknown.put("error", e.getClass().getSimpleName());
                    checked.add(unknown);
                }
            }

            List<Map<String, Object>> broken = checked.stream()
                    .filter(entry -> "BROKEN".equals(entry.get("status"))
                            || "MISSING".equals(entry.get("status")))
                    .toList();

            int repaired = 0;
            if (repair && !broken.isEmpty()) {
                repaired = repairBroken(broken);
            }

            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("totalHospitals", hospitals.size());
            summary.put("checked", checked.size());
            summary.put("brokenOrMissing", broken.size());
            summary.put("repaired", repaired);
            summary.put("details", broken);
            return summary;

        } finally {
            executor.shutdownNow();
        }
    }

    private int repairBroken(List<Map<String, Object>> broken) {

        Set<String> used = new LinkedHashSet<>();
        for (Hospital hospital : hospitalRepository.findAll()) {
            if (hospital.getImageUrl() != null
                    && !hospital.getImageUrl().isBlank()) {
                used.add(hospital.getImageUrl());
            }
        }

        List<String> pool = new ArrayList<>(HospitalRealImageInitializer.poolImages());
        pool.removeIf(used::contains);

        int poolIndex = 0;
        int repaired = 0;

        for (Map<String, Object> entry : broken) {
            Object idValue = entry.get("hospitalId");
            if (!(idValue instanceof Number)) {
                continue;
            }

            // Local uploads are never "repaired" remotely.
            Object urlValue = entry.get("imageUrl");
            if (urlValue instanceof String url && !url.startsWith("http")) {
                continue;
            }

            if (poolIndex >= pool.size()) {
                break;
            }

            Long id = ((Number) idValue).longValue();
            String replacement = pool.get(poolIndex++);

            hospitalRepository.findById(id).ifPresent(hospital -> {
                hospital.setImageUrl(replacement);
                hospitalRepository.save(hospital);
            });

            used.add(replacement);
            entry.put("repairedWith", replacement);
            repaired++;
        }

        return repaired;
    }

    private boolean checkUrl(String urlValue) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(urlValue);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(TIMEOUT_MS);
            connection.setReadTimeout(TIMEOUT_MS);
            connection.setInstanceFollowRedirects(true);
            connection.setRequestProperty("User-Agent", "MediCompare/1.0");

            int code = connection.getResponseCode();

            if (code == HttpURLConnection.HTTP_OK) {
                return true;
            }

            // Some hosts reject HEAD — retry with a ranged GET.
            if (code == HttpURLConnection.HTTP_BAD_METHOD
                    || code == HttpURLConnection.HTTP_FORBIDDEN
                    || code == 405) {
                return checkWithGet(urlValue);
            }

            return code >= 200 && code < 400;

        } catch (Exception e) {
            return false;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private boolean checkWithGet(String urlValue) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(urlValue);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(TIMEOUT_MS);
            connection.setReadTimeout(TIMEOUT_MS);
            connection.setInstanceFollowRedirects(true);
            connection.setRequestProperty("User-Agent", "MediCompare/1.0");
            connection.setRequestProperty("Range", "bytes=0-0");

            int code = connection.getResponseCode();
            return code >= 200 && code < 400;

        } catch (Exception e) {
            return false;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}
