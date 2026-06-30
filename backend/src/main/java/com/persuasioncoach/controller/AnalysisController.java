package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.response.AnalysisResponse;
import com.persuasioncoach.dto.response.FeedbackResponse;
import com.persuasioncoach.service.AnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@Tag(name = "Analysis", description = "Analiza konverzacijskih sesija")
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/{sessionId}/generate")
    @Operation(summary = "Generiši analizu za sesiju")
    public ResponseEntity<ApiResponse<AnalysisResponse>> generateAnalysis(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok("Analiza generisana",
                analysisService.generateAnalysis(userDetails.getUsername(), sessionId)));
    }

    @GetMapping("/{sessionId}")
    @Operation(summary = "Dohvati analizu sesije")
    public ResponseEntity<ApiResponse<AnalysisResponse>> getAnalysis(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                analysisService.getAnalysis(userDetails.getUsername(), sessionId)));
    }

    @GetMapping("/{sessionId}/feedback")
    @Operation(summary = "Dohvati feedback za sesiju")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getFeedback(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                analysisService.getFeedback(userDetails.getUsername(), sessionId)));
    }
}
