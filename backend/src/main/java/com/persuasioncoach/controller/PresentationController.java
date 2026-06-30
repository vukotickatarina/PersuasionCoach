package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.request.StartPresentationRequest;
import com.persuasioncoach.dto.response.PresentationSessionResponse;
import com.persuasioncoach.service.PresentationService;
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
@RequestMapping("/api/presentations")
@RequiredArgsConstructor
@Tag(name = "Presentations", description = "Upravljanje prezentacijskim sesijama")
public class PresentationController {

    private final PresentationService presentationService;

    @PostMapping("/start")
    @Operation(summary = "Pokreni prezentacijsku sesiju")
    public ResponseEntity<ApiResponse<PresentationSessionResponse>> startPresentation(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody StartPresentationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Prezentacija pokrenuta",
                presentationService.startPresentation(userDetails.getUsername(), request)));
    }

    @PostMapping("/{id}/upload-audio")
    @Operation(summary = "Upload audio snimka")
    public ResponseEntity<ApiResponse<PresentationSessionResponse>> uploadAudio(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok("Audio uploadovan",
                presentationService.uploadAudio(userDetails.getUsername(), id, file)));
    }

    @PostMapping("/{id}/upload-video")
    @Operation(summary = "Upload video snimka")
    public ResponseEntity<ApiResponse<PresentationSessionResponse>> uploadVideo(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok("Video uploadovan",
                presentationService.uploadVideo(userDetails.getUsername(), id, file)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Dohvati prezentacijsku sesiju")
    public ResponseEntity<ApiResponse<PresentationSessionResponse>> getPresentation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                presentationService.getPresentation(userDetails.getUsername(), id)));
    }

    @GetMapping("/history")
    @Operation(summary = "Historija prezentacijskih sesija")
    public ResponseEntity<ApiResponse<List<PresentationSessionResponse>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
                presentationService.getHistory(userDetails.getUsername())));
    }
}
