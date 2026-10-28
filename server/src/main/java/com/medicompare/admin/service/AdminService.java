package com.medicompare.admin.service;

import com.medicompare.admin.dto.LoginRequest;
import com.medicompare.admin.dto.LoginResponse;
import com.medicompare.admin.entity.Admin;
import com.medicompare.admin.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminService {

    private static final Logger log =
            LoggerFactory.getLogger(AdminService.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Admin createAdmin(
            String name,
            String email,
            String password
    ) {

        if (email == null || email.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required"
            );
        }

        if (password == null || password.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password is required"
            );
        }

        String normalizedEmail = email.trim();

        if (adminRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Admin with this email already exists"
            );
        }

        Admin admin = new Admin();

        admin.setName(
                name != null ? name.trim() : ""
        );

        admin.setEmail(normalizedEmail);

        // Always store a hashed password.
        admin.setPassword(
                passwordEncoder.encode(password)
        );

        admin.setRole("ADMIN");
        admin.setActive(true);

        Admin savedAdmin = adminRepository.save(admin);

        log.info(
                "Admin created successfully for email: {}",
                normalizedEmail
        );

        return savedAdmin;
    }

    public LoginResponse login(LoginRequest request) {

        /*
         * Validate request
         */
        if (request == null) {
            log.warn("Login failed: request is null");
            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        if (request.getEmail() == null
                || request.getEmail().trim().isEmpty()) {

            log.warn("Login failed: email is missing");

            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isEmpty()) {

            log.warn("Login failed: password is missing");

            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        String email = request.getEmail().trim();

        log.info("Login attempt for email: {}", email);

        /*
         * Find admin
         */
        Admin admin = adminRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> {

                    log.warn(
                            "Login failed: admin not found for email: {}",
                            email
                    );

                    return new BadCredentialsException(
                            "Invalid email or password."
                    );
                });

        log.info(
                "Admin found for email: {}, active: {}, role: {}",
                email,
                admin.isActive(),
                admin.getRole()
        );

        /*
         * Check whether account is active
         */
        if (!admin.isActive()) {

            log.warn(
                    "Login rejected because admin account is inactive: {}",
                    email
            );

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin account is inactive."
            );
        }

        /*
         * Check stored password
         */
        String storedPassword = admin.getPassword();

        if (storedPassword == null
                || storedPassword.isEmpty()) {

            log.error(
                    "Login failed: no password is stored for admin: {}",
                    email
            );

            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        /*
         * Normal BCrypt/password-encoder authentication.
         */
        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                storedPassword
        );

        /*
         * Legacy-password compatibility:
         *
         * If an old admin was accidentally stored with a plain-text
         * password, allow one successful login and immediately replace
         * it with a secure encoded password.
         *
         * New admins are ALWAYS stored encoded by createAdmin().
         */
        if (!passwordMatches
                && storedPassword.equals(request.getPassword())) {

            log.warn(
                    "Legacy plain-text password detected for {}. " +
                    "Migrating password to encoded format.",
                    email
            );

            admin.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );

            adminRepository.save(admin);

            passwordMatches = true;
        }

        if (!passwordMatches) {

            log.warn(
                    "Login failed: password mismatch for email: {}",
                    email
            );

            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        /*
         * Generate JWT
         */
        String token = jwtService.generateToken(
                admin.getEmail(),
                admin.getRole()
        );

        log.info(
                "Admin login successful for email: {}",
                email
        );

        return new LoginResponse(
                token,
                admin.getName(),
                admin.getEmail(),
                admin.getRole()
        );
    }

    public Admin findByEmail(String email) {

        String normalizedEmail = email != null
                ? email.trim()
                : "";

        return adminRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Admin not found"
                        )
                );
    }
}