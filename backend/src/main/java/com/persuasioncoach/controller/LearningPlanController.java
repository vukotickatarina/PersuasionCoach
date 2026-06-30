package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.request.UpdateLearningPlanRequest;
import com.persuasioncoach.dto.response.LearningPlanResponse;
import com.persuasioncoach.service.LearningPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/learning-plan")
@RequiredArgsConstructor
@Tag(name = "Learning Plan", description = "Upravljanje planom učenja")
public class LearningPlanController {

    private final LearningPlanService learningPlanService;

    @GetMapping
    @Operation(summary = "Dohvati plan učenja")
    public ResponseEntity<ApiResponse<LearningPlanResponse>> getLearningPlan(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(learningPlanService.getLearningPlan(userDetails.getUsername())));
    }

    @PutMapping
    @Operation(summary = "Ažuriraj plan učenja")
    public ResponseEntity<ApiResponse<LearningPlanResponse>> updateLearningPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateLearningPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Plan ažuriran",
                learningPlanService.updateLearningPlan(userDetails.getUsername(), request)));
    }

    @GetMapping("/next-exercise")
    @Operation(summary = "Sljedeća vježba iz plana")
    public ResponseEntity<ApiResponse<String>> getNextExercise(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(learningPlanService.getNextExercise(userDetails.getUsername())));
    }
}
