package com.medicompare.user.controller;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.user.entity.User;
import com.medicompare.user.entity.UserFavourite;
import com.medicompare.user.entity.UserHistory;
import com.medicompare.user.repository.UserFavouriteRepository;
import com.medicompare.user.repository.UserHistoryRepository;
import com.medicompare.user.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final UserFavouriteRepository favouriteRepository;
    private final UserHistoryRepository historyRepository;

    public UserController(
            UserRepository userRepository,
            HospitalRepository hospitalRepository,
            UserFavouriteRepository favouriteRepository,
            UserHistoryRepository historyRepository
    ) {
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.favouriteRepository = favouriteRepository;
        this.historyRepository = historyRepository;
    }

    // =========================
    // CURRENT USER PROFILE
    // =========================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(
                authentication
        );

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "message",
                            "User not authenticated"
                    ));
        }

        return ResponseEntity.ok(
                Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "enabled", user.isEnabled()
                )
        );
    }

    // =========================
    // UPDATE PROFILE
    // =========================

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> request
    ) {

        User user = getAuthenticatedUser(
                authentication
        );

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "message",
                            "User not authenticated"
                    ));
        }

        String name = request.get("name");

        if (name == null ||
                name.trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Name cannot be empty"
                    ));
        }

        user.setName(name.trim());

        User savedUser =
                userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "id", savedUser.getId(),
                        "name", savedUser.getName(),
                        "email", savedUser.getEmail(),
                        "role", savedUser.getRole(),
                        "enabled", savedUser.isEnabled()
                )
        );
    }

    // =========================
    // GET FAVOURITES
    // =========================

    @GetMapping("/favourites")
    public ResponseEntity<?> getFavourites(
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(
                authentication
        );

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "message",
                            "User not authenticated"
                    ));
        }

        List<UserFavourite> favourites =
                favouriteRepository
                        .findByUserOrderByCreatedAtDesc(
                                user
                        );

        List<Hospital> hospitals =
                favourites.stream()
                        .map(UserFavourite::getHospital)
                        .toList();

        return ResponseEntity.ok(hospitals);
    }

    // =========================
    // ADD FAVOURITE
    // =========================

    @PostMapping("/favourites/{hospitalId}")
    public ResponseEntity<?> addFavourite(
            Authentication authentication,
            @PathVariable Long hospitalId
    ) {

        User user = getAuthenticatedUser(
                authentication
        );

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "message",
                            "User not authenticated"
                    ));
        }

        Hospital hospital =
                hospitalRepository
                        .findById(hospitalId)
                        .orElse(null);

        if (hospital == null) {

            return ResponseEntity.notFound()
                    .build();
        }

        if (favouriteRepository
                .existsByUserIdAndHospitalId(
                        user.getId(),
                        hospitalId
                )) {

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Hospital already saved"
                    )
            );
        }

        UserFavourite favourite =
                new UserFavourite();

        favourite.setUser(user);
        favourite.setHospital(hospital);

        favouriteRepository.save(favourite);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Hospital added to favourites"
                )
        );
    }

    // =========================
    // REMOVE FAVOURITE
    // =========================

    @DeleteMapping("/favourites/{hospitalId}")
    public ResponseEntity<Void> removeFavourite(
            Authentication authentication,
            @PathVariable Long hospitalId
    ) {

        User user = getAuthenticatedUser(
                authentication
        );

        if (user == null) {
            return ResponseEntity.status(401)
                    .build();
        }

        favouriteRepository
                .deleteByUserIdAndHospitalId(
                        user.getId(),
                        hospitalId
                );

        return ResponseEntity.noContent()
                .build();
    }

    // =========================
    // CHECK FAVOURITE
    // =========================

    @GetMapping("/favourites/{hospitalId}")
    public ResponseEntity<?> isFavourite(
            Authentication authentication,
            @PathVariable Long hospitalId
    ) {

        User user = getAuthenticatedUser(
                authentication
        );

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "message",
                            "User not authenticated"
                    ));
        }

        boolean favourite =
                favouriteRepository
                        .existsByUserIdAndHospitalId(
                                user.getId(),
                                hospitalId
                        );

        return ResponseEntity.ok(
                Map.of(
                        "favourite",
                        favourite
                )
        );
    }

    // =========================
    // ADD HISTORY
    // =========================

    @PostMapping("/history/{hospitalId}")
    public ResponseEntity<?> addHistory(
            Authentication authentication,
            @PathVariable Long hospitalId
    ) {

        User user = getAuthenticatedUser(
                authentication
        );

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "message",
                            "User not authenticated"
                    ));
        }

        Hospital hospital =
                hospitalRepository
                        .findById(hospitalId)
                        .orElse(null);

        if (hospital == null) {
            return ResponseEntity.notFound()
                    .build();
        }

        UserHistory history =
                new UserHistory();

        history.setUser(user);
        history.setHospital(hospital);

        historyRepository.save(history);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Hospital added to history"
                )
        );
    }

    // =========================
    // GET HISTORY
    // =========================

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(
                authentication
        );

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "message",
                            "User not authenticated"
                    ));
        }

        List<UserHistory> history =
                historyRepository
                        .findTop20ByUserOrderByViewedAtDesc(
                                user
                        );

        List<Hospital> hospitals =
                history.stream()
                        .map(UserHistory::getHospital)
                        .toList();

        return ResponseEntity.ok(hospitals);
    }

    // =========================
    // CLEAR HISTORY
    // =========================

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory(
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(
                authentication
        );

        if (user == null) {
            return ResponseEntity.status(401)
                    .build();
        }

        historyRepository.deleteByUser(user);

        return ResponseEntity.noContent()
                .build();
    }

    // =========================
    // AUTHENTICATED USER
    // =========================

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return null;
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);
    }
}