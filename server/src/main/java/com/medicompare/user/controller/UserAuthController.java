package com.medicompare.user.controller;

import com.medicompare.user.dto.PasswordResetConfirmRequest;
import com.medicompare.user.dto.PasswordResetRequest;
import com.medicompare.user.dto.RegisterRequest;
import com.medicompare.user.dto.RegisterResponse;
import com.medicompare.user.dto.UserLoginRequest;
import com.medicompare.user.dto.UserLoginResponse;
import com.medicompare.user.entity.User;
import com.medicompare.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/auth")
public class UserAuthController {

    private final UserService userService;

    public UserAuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        RegisterResponse response =
                userService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(
            @Valid @RequestBody UserLoginRequest request) {

        UserLoginResponse response =
                userService.login(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(
            Authentication authentication) {

        User user =
                userService.getByEmail(authentication.getName());

        /*
         * Never expose the user's password.
         */
        user.setPassword(null);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @RequestBody PasswordResetRequest request) {

        userService.requestPasswordReset(request);

        /*
         * Always return 200 regardless of whether the email
         * exists, to avoid leaking account information.
         */
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @RequestBody PasswordResetConfirmRequest request) {

        userService.confirmPasswordReset(request);

        return ResponseEntity.ok().build();
    }
}