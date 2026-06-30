package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.request.*;
import com.persuasioncoach.dto.response.AuthResponse;
import com.persuasioncoach.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Autentifikacija i upravljanje nalogom")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Registracija novog korisnika")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Registracija uspješna", authService.register(request)));
    }

    @PostMapping("/login")
    @Operation(summary = "Prijava korisnika")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Prijava uspješna", authService.login(request)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Odjava korisnika")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Odjava uspješna"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Zahtjev za reset lozinke")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Upute za reset lozinke su poslane na vaš e-mail"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset lozinke putem tokena")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Lozinka je uspješno resetovana"));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Promjena lozinke")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Lozinka uspješno promijenjena"));
    }

    @PostMapping("/change-email")
    @Operation(summary = "Promjena e-mail adrese")
    public ResponseEntity<ApiResponse<Void>> changeEmail(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangeEmailRequest request) {
        authService.changeEmail(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("E-mail adresa uspješno promijenjena"));
    }
}
