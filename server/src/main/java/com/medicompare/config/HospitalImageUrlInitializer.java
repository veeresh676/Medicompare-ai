package com.medicompare.config;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class HospitalImageUrlInitializer {

    /*
     * Genuine, stable healthcare-facility photographs (Unsplash).
     * Representative photos — not claimed to be the exact building
     * of each hospital. Administrator-uploaded images and seeded
     * Unsplash images are always preserved; only blank or legacy
     * loremflickr placeholders are replaced.
     */
    private static final String P =
            "?auto=format&fit=crop&w=1200&q=70";

    private static final List<String> HOSPITAL_IMAGES = List.of(
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d" + P,
            "https://images.unsplash.com/photo-1586773860418-d37222d8fce3" + P,
            "https://images.unsplash.com/photo-1516549655169-df83a0774514" + P,
            "https://images.unsplash.com/photo-1538108149393-fbbd81895907" + P,
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d" + P,
            "https://images.unsplash.com/photo-1579684385127-1ef15d508118" + P,
            "https://images.unsplash.com/photo-1551601651-2a8555f1a136" + P,
            "https://images.unsplash.com/photo-1551190822-a9333d879b1f" + P,
            "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133" + P,
            "https://images.unsplash.com/photo-1629909613654-28e377c37b09" + P,
            "https://images.unsplash.com/photo-1512678080530-7760d81faba6" + P,
            "https://images.unsplash.com/photo-1538805060514-97d9cc17730c" + P,
            "https://images.unsplash.com/photo-1666214280557-f1b5022eb634" + P,
            "https://images.unsplash.com/photo-1551076805-e1869033e561" + P,
            "https://images.unsplash.com/photo-1516574187841-c49cc3c12f46" + P,
            "https://images.unsplash.com/photo-1504439468489-c8920d796a29" + P,
            "https://images.unsplash.com/photo-1519494080410-f9aa76cb4283" + P,
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88" + P,
            "https://images.unsplash.com/photo-1583324113626-70df0f4deaab" + P,
            "https://images.unsplash.com/photo-1576091160550-2173dba999ef" + P
    );


    @Bean
    @Order(30)
    CommandLineRunner assignHospitalImages(
            HospitalRepository hospitalRepository
    ) {

        return args -> {

            System.out.println(
                    "Checking hospital image URLs..."
            );

            List<Hospital> hospitals =
                    hospitalRepository.findAll();

            int updated = 0;

            java.util.Set<String> usedUrls =
                    hospitals.stream()
                            .map(Hospital::getImageUrl)
                            .filter(url ->
                                    url != null && !url.isBlank())
                            .collect(java.util.stream.Collectors
                                    .toCollection(
                                            java.util.LinkedHashSet::new));

            for (int i = 0; i < hospitals.size(); i++) {

                Hospital hospital =
                        hospitals.get(i);

                /*
                 * Keep administrator-uploaded/local images and
                 * already-seeded genuine images.
                 * Only replace blank values or legacy
                 * loremflickr placeholders.
                 */
                String currentImage =
                        hospital.getImageUrl();

                if (currentImage != null
                        && !currentImage.isBlank()
                        && !currentImage.contains("loremflickr.com")) {

                    continue;
                }

                /*
                 * Pick the first pool image not already used by
                 * another hospital so new rows never duplicate
                 * an existing photo. Fall back to rotation only
                 * when the pool is fully consumed.
                 */
                String imageUrl = null;

                for (String candidate : HOSPITAL_IMAGES) {
                    if (!usedUrls.contains(candidate)) {
                        imageUrl = candidate;
                        break;
                    }
                }

                if (imageUrl == null) {
                    imageUrl = HOSPITAL_IMAGES.get(
                            i % HOSPITAL_IMAGES.size());
                }

                usedUrls.add(imageUrl);

                hospital.setImageUrl(imageUrl);

                hospitalRepository.save(hospital);

                updated++;
            }

            System.out.println(
                    "Hospital images updated: "
                            + updated
            );

            System.out.println(
                    "Hospitals checked: "
                            + hospitals.size()
            );
        };
    }
}
