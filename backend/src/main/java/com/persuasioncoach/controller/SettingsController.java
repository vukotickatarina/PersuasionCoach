package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "Podešavanja aplikacije")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    @Operation(summary = "Dohvati podešavanja korisnika")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> settings = Map.of(
                "languages", List.of("Bosanski", "English", "Srpski", "Hrvatski"),
                "about", settingsService.getAbout()
        );
        return ResponseEntity.ok(ApiResponse.ok(settings));
    }

    @PutMapping("/language")
    @Operation(summary = "Promijeni jezik aplikacije")
    public ResponseEntity<ApiResponse<Void>> updateLanguage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        settingsService.updateLanguage(userDetails.getUsername(), body.get("language"));
        return ResponseEntity.ok(ApiResponse.ok("Jezik promijenjen"));
    }

    @PutMapping("/privacy")
    @Operation(summary = "Ažuriraj podešavanja privatnosti")
    public ResponseEntity<ApiResponse<Void>> updatePrivacy(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        settingsService.updatePrivacy(userDetails.getUsername(), body.get("privacySettings"));
        return ResponseEntity.ok(ApiResponse.ok("Podešavanja privatnosti ažurirana"));
    }

    @GetMapping("/faq")
    @Operation(summary = "Dohvati FAQ pitanja i odgovore")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getFaq() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getFaq()));
    }

    @GetMapping("/about")
    @Operation(summary = "Informacije o aplikaciji")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAbout() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getAbout()));
    }

    @GetMapping("/terms")
    @Operation(summary = "Uvjeti korišćenja")
    public ResponseEntity<ApiResponse<String>> getTerms() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getTerms()));
    }
}
