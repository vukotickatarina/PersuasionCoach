package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.request.CreateReminderRequest;
import com.persuasioncoach.dto.response.ReminderResponse;
import com.persuasioncoach.service.ReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
@Tag(name = "Reminders", description = "Upravljanje podsjetnicima")
public class ReminderController {

    private final ReminderService reminderService;

    @GetMapping
    @Operation(summary = "Dohvati sve podsjetike")
    public ResponseEntity<ApiResponse<List<ReminderResponse>>> getReminders(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(reminderService.getReminders(userDetails.getUsername())));
    }

    @PostMapping
    @Operation(summary = "Kreiraj novi podsjetnik")
    public ResponseEntity<ApiResponse<ReminderResponse>> createReminder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateReminderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Podsjetnik kreiran",
                reminderService.createReminder(userDetails.getUsername(), request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Ažuriraj podsjetnik")
    public ResponseEntity<ApiResponse<ReminderResponse>> updateReminder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody CreateReminderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Podsjetnik ažuriran",
                reminderService.updateReminder(userDetails.getUsername(), id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Obriši podsjetnik")
    public ResponseEntity<ApiResponse<Void>> deleteReminder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        reminderService.deleteReminder(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok("Podsjetnik obrisan"));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Uključi/isključi podsjetnik")
    public ResponseEntity<ApiResponse<ReminderResponse>> toggleReminder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(reminderService.toggleReminder(userDetails.getUsername(), id)));
    }
}
