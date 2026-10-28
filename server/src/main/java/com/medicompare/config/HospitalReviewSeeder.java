package com.medicompare.config;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.review.entity.HospitalReview;
import com.medicompare.review.repository.HospitalReviewRepository;
import com.medicompare.user.entity.User;
import com.medicompare.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Seeds at least 5 realistic patient reviews for every hospital.
 *
 * - Runs after HospitalDataInitializer (@Order 1) and SeedReviewCleanupRunner (@Order 2)
 * - Idempotent: only adds missing reviews if count < 5
 * - Uses 8 dedicated seed reviewer accounts (distinct from the 8 deleted fake reviewers)
 * - Ratings are weighted by the hospital's platform rating so higher-rated hospitals naturally get better reviews
 * - Comments are real-sounding, varied per rating
 * - Reviews are included automatically in AI comparison via HospitalComparisonService + CompareVerdictService
 */
@Component
@Order(3)
public class HospitalReviewSeeder implements CommandLineRunner {

    private static final List<String> SEED_REVIEWER_EMAILS = List.of(
            "seed.reviewer1@medicompare.internal",
            "seed.reviewer2@medicompare.internal",
            "seed.reviewer3@medicompare.internal",
            "seed.reviewer4@medicompare.internal",
            "seed.reviewer5@medicompare.internal",
            "seed.reviewer6@medicompare.internal",
            "seed.reviewer7@medicompare.internal",
            "seed.reviewer8@medicompare.internal"
    );

    private static final List<String> SEED_REVIEWER_NAMES = List.of(
            "Priya Sharma",
            "Rahul Verma",
            "Ananya Reddy",
            "Vikram Singh",
            "Sneha Patel",
            "Arjun Kumar",
            "Kavya Nair",
            "Rohit Gupta"
    );

    // Comments per rating - realistic, varied, patient-like
    private static final List<String> COMMENTS_5 = List.of(
            "Excellent care! Doctors were very attentive, explained everything clearly and the staff was extremely supportive. Highly recommend this hospital.",
            "Outstanding experience. Very clean facility, modern equipment and compassionate nursing care. My treatment was smooth and well coordinated.",
            "Best hospital in the area. Specialist doctors are top-notch, consultation was thorough and the follow-up was prompt. Felt very safe.",
            "Wonderful service. From admission to discharge everything was well managed. Doctors listened patiently and treatment was effective.",
            "Superb healthcare experience. The team was professional, caring and very responsive. My family is grateful for the excellent outcome.",
            "Five stars for the doctors and nursing staff. They handled my case with great expertise and empathy. Facilities are well maintained.",
            "Truly impressed with the quality of care. Appointments were on time, doctors were knowledgeable and the entire process was hassle-free.",
            "Exceptional hospital! The medical team is very skilled, the infrastructure is world-class and the supportive care is outstanding.",
            "My surgery and recovery were handled perfectly. The doctors and physiotherapy team were excellent. Very hygienic and well organized hospital.",
            "Great experience for my elderly parents. Doctors were patient, billing was transparent and the staff treated everyone with kindness."
    );

    private static final List<String> COMMENTS_4 = List.of(
            "Very good experience overall. Doctors are knowledgeable and caring, though waiting time was a bit longer than expected.",
            "Good hospital with competent specialists. Treatment was effective and the staff was helpful. Minor delays in billing but manageable.",
            "Satisfied with the consultation. Doctor explained the issue well and prescribed appropriately. Facility is clean and well maintained.",
            "Positive experience. Nursing care was attentive and the diagnosis was accurate. Slightly crowded but the service was solid.",
            "Good value for the consultation. Doctors are experienced and the support staff is courteous. Follow-up reminders were helpful.",
            "Well managed hospital. My checkup was thorough and the reports were delivered quickly. A little improvement in waiting area would help.",
            "Quality care with friendly staff. The doctor addressed all my concerns and the treatment plan was clear. Would visit again.",
            "Reliable hospital for family healthcare. Doctors are approachable and the pharmacy service is convenient. Overall good.",
            "Helpful team and clean environment. The consultation fee was reasonable for the quality provided. Prescription guidance was clear.",
            "Good specialist care. The appointment scheduling could be smoother, but the medical expertise makes it worth it."
    );

    private static final List<String> COMMENTS_3 = List.of(
            "Average experience. Doctor was competent but the consultation felt rushed. Could improve on patient communication.",
            "Decent hospital with okay facilities. Treatment helped but administrative process took longer than expected.",
            "Overall fine but not outstanding. The specialist was knowledgeable, however follow-up was a bit delayed.",
            "Mixed experience. Medical care was adequate but the waiting time was quite long and the staff seemed overwhelmed.",
            "Satisfactory service. The consultation was brief and I wished for more explanation. Infrastructure is okay."
    );

    private static final List<String> COMMENTS_2 = List.of(
            "Below my expectations. Waiting time was excessive and the doctor spent very little time. Facilities need improvement.",
            "Disappointed with the service. Diagnosis seemed hurried and the staff was not very responsive to queries."
    );

    private static final List<String> COMMENTS_1 = List.of(
            "Poor experience. Long delays, lack of proper communication and billing was confusing. Would not recommend.",
            "Very unsatisfactory. The consultation was extremely rushed and the support staff was unhelpful."
    );

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final HospitalReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public HospitalReviewSeeder(HospitalRepository hospitalRepository,
                                UserRepository userRepository,
                                HospitalReviewRepository reviewRepository,
                                PasswordEncoder passwordEncoder) {
        this.hospitalRepository = hospitalRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<User> seedUsers = ensureSeedUsersExist();
        List<Hospital> hospitals = hospitalRepository.findAll();

        if (hospitals.isEmpty()) {
            System.out.println("[ReviewSeeder] No hospitals found, skipping.");
            return;
        }

        int totalCreated = 0;

        for (Hospital hospital : hospitals) {
            long existing = reviewRepository.countByHospitalId(hospital.getId());
            if (existing >= 5) {
                continue;
            }

            // Need at least 5, add variability 5-7 total so some hospitals have 6 or 7
            Random hospitalRandom = new Random(hospital.getId() * 31L + 7919);
            int extra = hospitalRandom.nextInt(3); // 0-2
            int target = 5 + extra;
            int toCreate = (int) (target - existing);
            if (toCreate <= 0) continue;

            // Shuffle seed users deterministically per hospital
            List<User> shuffled = new ArrayList<>(seedUsers);
            // deterministic shuffle per hospital
            for (int i = shuffled.size() - 1; i > 0; i--) {
                int j = hospitalRandom.nextInt(i + 1);
                User tmp = shuffled.get(i);
                shuffled.set(i, shuffled.get(j));
                shuffled.set(j, tmp);
            }

            int createdForHospital = 0;
            for (User reviewer : shuffled) {
                if (createdForHospital >= toCreate) break;
                if (reviewRepository.existsByUserIdAndHospitalId(reviewer.getId(), hospital.getId())) {
                    continue;
                }

                int rating = generateWeightedRating(hospital.getRating(), hospitalRandom);
                String comment = pickComment(rating, hospitalRandom);

                HospitalReview review = new HospitalReview();
                review.setUser(reviewer);
                review.setHospital(hospital);
                review.setRating(rating);
                review.setComment(comment);

                // Stagger createdAt within last 60-120 days for realism
                int daysAgo = 5 + hospitalRandom.nextInt(90);
                int hoursAgo = hospitalRandom.nextInt(12);
                LocalDateTime createdAt = LocalDateTime.now().minusDays(daysAgo).minusHours(hoursAgo)
                        .minusMinutes(hospitalRandom.nextInt(60));
                review.setCreatedAt(createdAt);
                review.setUpdatedAt(createdAt.plusHours(hospitalRandom.nextInt(24)));

                reviewRepository.save(review);
                createdForHospital++;
                totalCreated++;
            }
        }

        System.out.println();
        System.out.println("==============================================");
        System.out.println("Hospital review seeding complete");
        System.out.println("Hospitals checked: " + hospitals.size());
        System.out.println("New reviews created: " + totalCreated);
        System.out.println("Seed reviewer accounts: " + seedUsers.size());
        System.out.println("Each hospital now has >=5 reviews");
        System.out.println("Reviews are weighted into AI comparison (quality + evidence)");
        System.out.println("==============================================");
        System.out.println();
    }

    private List<User> ensureSeedUsersExist() {
        List<User> users = new ArrayList<>();
        for (int i = 0; i < SEED_REVIEWER_EMAILS.size(); i++) {
            String email = SEED_REVIEWER_EMAILS.get(i);
            String name = SEED_REVIEWER_NAMES.get(i);

            User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
            if (user == null) {
                user = new User();
                user.setName(name);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("Reviewer@123"));
                user.setRole("USER");
                user.setEnabled(true);
                user = userRepository.save(user);
                System.out.println("[ReviewSeeder] Created seed reviewer: " + email + " (" + name + ")");
            }
            users.add(user);
        }
        return users;
    }

    private int generateWeightedRating(Double platformRating, Random rnd) {
        double base = platformRating == null ? 4.2 : platformRating;
        double p = rnd.nextDouble();

        // Higher platform rating -> more 5s, fewer low ratings
        if (base >= 4.7) {
            // 55% 5, 30% 4, 10% 3, 3% 2, 2% 1
            if (p < 0.55) return 5;
            if (p < 0.85) return 4;
            if (p < 0.95) return 3;
            if (p < 0.98) return 2;
            return 1;
        } else if (base >= 4.5) {
            // 40% 5, 35% 4, 15% 3, 6% 2, 4% 1
            if (p < 0.40) return 5;
            if (p < 0.75) return 4;
            if (p < 0.90) return 3;
            if (p < 0.96) return 2;
            return 1;
        } else if (base >= 4.3) {
            // 30% 5, 35% 4, 20% 3, 10% 2, 5% 1
            if (p < 0.30) return 5;
            if (p < 0.65) return 4;
            if (p < 0.85) return 3;
            if (p < 0.95) return 2;
            return 1;
        } else {
            // lower rated: more variance
            if (p < 0.25) return 5;
            if (p < 0.50) return 4;
            if (p < 0.75) return 3;
            if (p < 0.90) return 2;
            return 1;
        }
    }

    private String pickComment(int rating, Random rnd) {
        List<String> pool;
        switch (rating) {
            case 5 -> pool = COMMENTS_5;
            case 4 -> pool = COMMENTS_4;
            case 3 -> pool = COMMENTS_3;
            case 2 -> pool = COMMENTS_2;
            default -> pool = COMMENTS_1;
        }
        return pool.get(rnd.nextInt(pool.size()));
    }
}
