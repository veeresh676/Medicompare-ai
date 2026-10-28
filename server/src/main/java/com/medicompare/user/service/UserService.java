package com.medicompare.user.service;

import com.medicompare.admin.service.JwtService;
import com.medicompare.user.dto.PasswordResetConfirmRequest;
import com.medicompare.user.dto.PasswordResetRequest;
import com.medicompare.user.dto.RegisterRequest;
import com.medicompare.user.dto.RegisterResponse;
import com.medicompare.user.dto.UserLoginRequest;
import com.medicompare.user.dto.UserLoginResponse;
import com.medicompare.user.entity.User;
import com.medicompare.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Transactional
    public RegisterResponse register(
            RegisterRequest request
    ) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Registration request is required."
            );
        }

        if (request.getEmail() == null
                || request.getEmail().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required."
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password is required."
            );
        }

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists."
            );
        }

        User user = new User();

        user.setName(
                request.getName() != null
                        ? request.getName().trim()
                        : ""
        );

        user.setEmail(email);

        /*
         * Always store the password encoded.
         */
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        /*
         * Public registration can NEVER create an ADMIN.
         */
        user.setRole("USER");

        user.setEnabled(true);

        User savedUser =
                userRepository.save(user);

        /*
         * Auto-login: generate a JWT immediately after registration
         * so the frontend can log the user straight in without a
         * separate login request.
         */
        String token =
                jwtService.generateToken(
                        savedUser.getEmail(),
                        savedUser.getRole()
                );

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Account created successfully.",
                token
        );
    }

    @Transactional
    public UserLoginResponse login(
            UserLoginRequest request
    ) {

        if (request == null) {
            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        if (request.getEmail() == null
                || request.getEmail().trim().isEmpty()) {

            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isEmpty()) {

            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        User user =
                userRepository
                        .findByEmailIgnoreCase(email)
                        .orElseThrow(() ->
                                new BadCredentialsException(
                                        "Invalid email or password."
                                )
                        );

        if (!user.isEnabled()) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account has been disabled."
            );
        }

        if (user.getPassword() == null
                || user.getPassword().isEmpty()) {

            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!passwordMatches
                && request.getPassword()
                .equals(user.getPassword())) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );

            userRepository.save(user);

            passwordMatches = true;
        }

        if (!passwordMatches) {

            throw new BadCredentialsException(
                    "Invalid email or password."
            );
        }

        String token =
                jwtService.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        return new UserLoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    @Transactional(readOnly = true)
    public User getByEmail(
            String email
    ) {

        if (email == null
                || email.trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required."
            );
        }

        return userRepository
                .findByEmailIgnoreCase(
                        email.trim()
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found."
                        )
                );
    }

    @Transactional
    public void requestPasswordReset(
            PasswordResetRequest request
    ) {

        if (request == null
                || request.getEmail() == null
                || request.getEmail().trim().isEmpty()) {
            return;
        }

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);

        /*
         * Always return silently even if the user doesn't exist.
         * This prevents leaking which emails are registered.
         */
        if (user == null) {
            return;
        }

        SecureRandom random = new SecureRandom();
        byte[] tokenBytes = new byte[32];
        random.nextBytes(tokenBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);

        user.setResetToken(token);
        user.setResetTokenExpiry(
                Instant.now().plus(30, ChronoUnit.MINUTES)
        );

        userRepository.save(user);

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                token
        );
    }

    @Transactional
    public void confirmPasswordReset(
            PasswordResetConfirmRequest request
    ) {

        if (request == null
                || request.getToken() == null
                || request.getToken().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reset token is required."
            );
        }

        if (request.getNewPassword() == null
                || request.getNewPassword().length() < 8) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must be at least 8 characters."
            );
        }

        User user = userRepository
                .findByResetToken(request.getToken())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Invalid or expired reset link."
                        )
                );

        if (user.getResetTokenExpiry() == null
                || user.getResetTokenExpiry().isBefore(Instant.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This reset link has expired. Please request a new one."
            );
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);
    }
}