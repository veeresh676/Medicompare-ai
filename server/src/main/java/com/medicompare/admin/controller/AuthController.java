package com.medicompare.admin.controller;

import com.medicompare.admin.dto.LoginRequest;
import com.medicompare.admin.dto.LoginResponse;
import com.medicompare.auth.UnifiedLoginService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UnifiedLoginService unifiedLoginService;

    public AuthController(UnifiedLoginService unifiedLoginService) {
        this.unifiedLoginService = unifiedLoginService;
    }

    /**
     * Single login endpoint for the unified login page.
     * Authenticates against the existing admin accounts first,
     * then the existing user accounts, and returns the role so the
     * frontend can open the admin panel or the user app.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = unifiedLoginService.login(request);

        return ResponseEntity.ok(response);
    }
}