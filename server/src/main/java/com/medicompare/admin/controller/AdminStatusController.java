package com.medicompare.admin.controller;

import com.medicompare.booking.repository.BookingRepository;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.review.repository.HospitalReviewRepository;
import com.medicompare.serviceentity.HospitalServiceRepository;
import com.medicompare.user.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Proves where MediCompare data lives: a single PostgreSQL database.
 * Returns the active JDBC target (host + database, credentials never
 * included) together with live row counts per table.
 *
 * GET /api/admin/status/database
 */
@RestController
@RequestMapping("/api/admin/status")
@CrossOrigin(origins = "*")
public class AdminStatusController {

    private final DataSource dataSource;
    private final HospitalRepository hospitalRepository;
    private final HospitalServiceRepository hospitalServiceRepository;
    private final HospitalReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public AdminStatusController(
            DataSource dataSource,
            HospitalRepository hospitalRepository,
            HospitalServiceRepository hospitalServiceRepository,
            HospitalReviewRepository reviewRepository,
            UserRepository userRepository,
            BookingRepository bookingRepository
    ) {
        this.dataSource = dataSource;
        this.hospitalRepository = hospitalRepository;
        this.hospitalServiceRepository = hospitalServiceRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> databaseStatus() {

        Map<String, Object> status = new LinkedHashMap<>();

        try (var connection = dataSource.getConnection()) {

            var meta = connection.getMetaData();

            status.put("databaseProduct", meta.getDatabaseProductName());
            status.put("jdbcUrl", meta.getURL());
            status.put("singleDatasource",
                    "All MediCompare tables live in this one PostgreSQL database. "
                            + "No secondary, embedded, or external database is configured.");

        } catch (Exception e) {
            status.put("error",
                    "Unable to read database metadata: " + e.getMessage());
        }

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("hospitals", hospitalRepository.count());
        counts.put("hospitalServices", hospitalServiceRepository.count());
        counts.put("hospitalReviews", reviewRepository.count());
        counts.put("users", userRepository.count());
        counts.put("bookings", bookingRepository.count());

        status.put("rowCounts", counts);

        return ResponseEntity.ok(status);
    }
}
