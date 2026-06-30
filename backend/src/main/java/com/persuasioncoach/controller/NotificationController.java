package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.request.NotificationPreferencesRequest;
import com.persuasioncoach.dto.response.NotificationResponse;
import com.persuasioncoach.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Upravljanje notifikacijama")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Dohvati sve notifikacije")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getNotifications(userDetails.getUsername())));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Označi notifikaciju kao pročitanu")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.markAsRead(userDetails.getUsername(), id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Obriši notifikaciju")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        notificationService.deleteNotification(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok("Notifikacija obrisana"));
    }

    @PutMapping("/preferences")
    @Operation(summary = "Ažuriraj preferencije notifikacija")
    public ResponseEntity<ApiResponse<Void>> updatePreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody NotificationPreferencesRequest request) {
        notificationService.updatePreferences(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Preferencije ažurirane"));
    }
}
