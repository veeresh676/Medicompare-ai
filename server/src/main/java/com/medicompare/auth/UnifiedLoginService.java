package com.medicompare.auth;

import com.medicompare.admin.dto.LoginRequest;
import com.medicompare.admin.dto.LoginResponse;
import com.medicompare.admin.entity.Admin;
import com.medicompare.admin.repository.AdminRepository;
import com.medicompare.admin.service.JwtService;
import com.medicompare.user.entity.User;
import com.medicompare.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Single login entry point for the unified login page.
 *
 * Looks up the existing ADMIN record first, then the existing USER
 * record. Never creates accounts — it only authenticates rows that
 * already exist in the database.
 */
@Service
public class UnifiedLoginService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UnifiedLoginService(
            AdminRepository adminRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {

        if (request == null
                || request.getEmail() == null
                || request.getEmail().trim().isEmpty()
                || request.getPassword() == null
                || request.getPassword().isEmpty()) {

            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        String email = request.getEmail().trim();
        String rawPassword = request.getPassword();

        /*
         * Existing administrators first — an admin signing in with
         * their admin credentials receives role ADMIN and the
         * frontend opens the admin panel for them.
         */
        Admin admin = adminRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);

        if (admin != null) {
            return loginAdmin(admin, rawPassword);
        }

        /*
         * Otherwise fall back to the existing user accounts.
         */
        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException(
                        "Invalid email or password."
                ));

        return loginUser(user, rawPassword);
    }

    private LoginResponse loginAdmin(Admin admin, String rawPassword) {

        if (!admin.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin account is inactive."
            );
        }

        if (!matchesAndMigrateAdmin(admin, rawPassword)) {
            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        String token = jwtService.generateToken(
                admin.getEmail(),
                admin.getRole()
        );

        return new LoginResponse(
                token,
                admin.getName(),
                admin.getEmail(),
                admin.getRole()
        );
    }

    private LoginResponse loginUser(User user, String rawPassword) {

        if (!user.isEnabled()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account has been disabled."
            );
        }

        if (!matchesAndMigrateUser(user, rawPassword)) {
            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );

        return new LoginResponse(
                token,
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    private boolean matchesAndMigrateAdmin(Admin admin, String rawPassword) {

        String stored = admin.getPassword();

        if (stored == null || stored.isEmpty()) {
            return false;
        }

        if (passwordEncoder.matches(rawPassword, stored)) {
            return true;
        }

        // Legacy plain-text compatibility: migrate on success.
        if (stored.equals(rawPassword)) {
            admin.setPassword(passwordEncoder.encode(rawPassword));
            adminRepository.save(admin);
            return true;
        }

        return false;
    }

    private boolean matchesAndMigrateUser(User user, String rawPassword) {

        String stored = user.getPassword();

        if (stored == null || stored.isEmpty()) {
            return false;
        }

        if (passwordEncoder.matches(rawPassword, stored)) {
            return true;
        }

        // Legacy plain-text compatibility: migrate on success.
        if (stored.equals(rawPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }

        return false;
    }
}
