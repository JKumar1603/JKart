package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.AuthStatsResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.OtpVerifyRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendRegistrationOtp(@Valid @RequestBody RegisterRequest request) {
        String response = authService.sendRegistrationOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtpAndRegister(@Valid @RequestBody OtpVerifyRequest request) {
        AuthResponse response = authService.verifyOtpAndRegister(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<AuthStatsResponse> getAuthStats() {
        AuthStatsResponse stats = authService.getAuthStats();
        return ResponseEntity.ok(stats);
    }
}