package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.response.ProgressOverviewResponse;
import com.persuasioncoach.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@Tag(name = "Progress", description = "Praćenje napretka korisnika")
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/overview")
    @Operation(summary = "Pregled napretka")
    public ResponseEntity<ApiResponse<ProgressOverviewResponse>> getOverview(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(progressService.getOverview(userDetails.getUsername())));
    }

    @GetMapping("/timeline")
    @Operation(summary = "Vremenski prikaz napretka")
    public ResponseEntity<ApiResponse<ProgressOverviewResponse>> getTimeline(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(progressService.getTimeline(userDetails.getUsername())));
    }

    @GetMapping("/by-topic")
    @Operation(summary = "Napredak po temama")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getByTopic(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(progressService.getByTopic(userDetails.getUsername())));
    }

    @GetMapping("/report")
    @Operation(summary = "Generiši izvještaj napretka")
    public ResponseEntity<ApiResponse<String>> generateReport(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(progressService.generateReport(userDetails.getUsername())));
    }

    @GetMapping("/report/download")
    @Operation(summary = "Preuzmi PDF izvještaj")
    public ResponseEntity<byte[]> downloadReport(
            @AuthenticationPrincipal UserDetails userDetails) {
        byte[] pdf = progressService.downloadReportPdf(userDetails.getUsername());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=progress-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
