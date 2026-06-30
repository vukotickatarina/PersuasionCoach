package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.request.UpdateUserRequest;
import com.persuasioncoach.dto.response.BadgeResponse;
import com.persuasioncoach.dto.response.StatsResponse;
import com.persuasioncoach.dto.response.UserResponse;
import com.persuasioncoach.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Upravljanje korisničkim profilom")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Dohvati trenutnog korisnika")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentUser(userDetails.getUsername())));
    }

    @PutMapping("/me")
    @Operation(summary = "Ažuriraj profil korisnika")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profil ažuriran", userService.updateUser(userDetails.getUsername(), request)));
    }

    @PostMapping("/me/avatar")
    @Operation(summary = "Upload avatara korisnika")
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok("Avatar ažuriran", userService.uploadAvatar(userDetails.getUsername(), file)));
    }

    @GetMapping("/me/badges")
    @Operation(summary = "Dohvati značke korisnika")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getUserBadges(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserBadges(userDetails.getUsername())));
    }

    @GetMapping("/me/stats")
    @Operation(summary = "Dohvati statistike korisnika")
    public ResponseEntity<ApiResponse<StatsResponse>> getUserStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserStats(userDetails.getUsername())));
    }

    @DeleteMapping("/me")
    @Operation(summary = "Obriši nalog korisnika")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.deleteUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Nalog uspješno obrisan"));
    }
}
