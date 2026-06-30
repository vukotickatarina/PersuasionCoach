package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.request.CreateScenarioRequest;
import com.persuasioncoach.dto.response.ScenarioResponse;
import com.persuasioncoach.service.ScenarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Scenarios", description = "Upravljanje scenarijima")
public class ScenarioController {

    private final ScenarioService scenarioService;

    @GetMapping("/topics/{topicId}/scenarios")
    @Operation(summary = "Dohvati scenarije za određenu temu")
    public ResponseEntity<ApiResponse<List<ScenarioResponse>>> getScenariosByTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(ApiResponse.ok(scenarioService.getScenariosByTopic(topicId)));
    }

    @GetMapping("/scenarios/{id}")
    @Operation(summary = "Dohvati scenarij po ID-u")
    public ResponseEntity<ApiResponse<ScenarioResponse>> getScenarioById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(scenarioService.getScenarioById(id)));
    }

    @PostMapping("/scenarios")
    @Operation(summary = "Kreiraj novi scenarij (Admin)")
    public ResponseEntity<ApiResponse<ScenarioResponse>> createScenario(@Valid @RequestBody CreateScenarioRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Scenarij kreiran", scenarioService.createScenario(request)));
    }

    @PutMapping("/scenarios/{id}")
    @Operation(summary = "Ažuriraj scenarij (Admin)")
    public ResponseEntity<ApiResponse<ScenarioResponse>> updateScenario(
            @PathVariable Long id,
            @Valid @RequestBody CreateScenarioRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Scenarij ažuriran", scenarioService.updateScenario(id, request)));
    }

    @DeleteMapping("/scenarios/{id}")
    @Operation(summary = "Obriši scenarij (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteScenario(@PathVariable Long id) {
        scenarioService.deleteScenario(id);
        return ResponseEntity.ok(ApiResponse.ok("Scenarij obrisan"));
    }
}
