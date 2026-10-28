package com.medicompare.config;

import com.medicompare.review.repository.HospitalReviewRepository;
import com.medicompare.user.entity.User;
import com.medicompare.user.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/*
 * One-time cleanup of the retired fake review seeding.
 *
 * The old HospitalReviewDataInitializer created 8 fake reviewer
 * accounts (*@reviewer@medicompare.com) and attached at least 6
 * fabricated reviews to every hospital. Those rows misrepresent
 * real patient experience, so they are removed here.
 *
 * Only the known seed accounts are touched — reviews written by
 * genuine registered users are NEVER deleted.
 *
 * After the first run that removes them, this runner is a no-op.
 */
@Component
@Order(2)
public class SeedReviewCleanupRunner implements CommandLineRunner {

    private static final List<String> SEED_REVIEWER_EMAILS = List.of(
            "priya.reviewer@medicompare.com",
            "rahul.reviewer@medicompare.com",
            "ananya.reviewer@medicompare.com",
            "vikram.reviewer@medicompare.com",
            "sneha.reviewer@medicompare.com",
            "arjun.reviewer@medicompare.com",
            "kavya.reviewer@medicompare.com",
            "rohit.reviewer@medicompare.com"
    );

    private final HospitalReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public SeedReviewCleanupRunner(
            HospitalReviewRepository reviewRepository,
            UserRepository userRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {

        long removedReviews = 0;
        int removedAccounts = 0;

        for (String email : SEED_REVIEWER_EMAILS) {

            User seedUser = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElse(null);

            if (seedUser == null || seedUser.getId() == null) {
                continue;
            }

            long count = reviewRepository.countByUserId(
                    seedUser.getId());

            if (count > 0) {
                reviewRepository.deleteByUserId(
                        seedUser.getId());
                removedReviews += count;
            }

            userRepository.delete(seedUser);
            removedAccounts++;
        }

        System.out.println();
        System.out.println("==============================================");
        System.out.println("Seed review cleanup complete");
        System.out.println("Fake reviews removed: " + removedReviews);
        System.out.println("Fake reviewer accounts removed: " + removedAccounts);
        System.out.println("Genuine user reviews were preserved.");
        System.out.println("==============================================");
        System.out.println();
    }
}
