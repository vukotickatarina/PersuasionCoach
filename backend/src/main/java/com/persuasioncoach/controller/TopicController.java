package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.request.CreateCustomTopicRequest;
import com.persuasioncoach.dto.request.CreateTopicRequest;
import com.persuasioncoach.dto.response.ScenarioResponse;
import com.persuasioncoach.dto.response.TopicResponse;
import com.persuasioncoach.service.TopicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@Tag(name = "Topics", description = "Upravljanje temama")
public class TopicController {

    private final TopicService topicService;

    @GetMapping
    @Operation(summary = "Dohvati sve teme")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getAllTopics(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(ApiResponse.ok(topicService.getAllTopics(difficulty, sort)));
    }

    @GetMapping("/categories")
    @Operation(summary = "Dohvati sve kategorije (teme bez roditelja)")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(topicService.getCategories()));
    }

    @GetMapping("/{id}/subcategories")
    @Operation(summary = "Dohvati podkategorije kategorije")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getSubcategories(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(topicService.getSubcategories(id)));
    }

    @PostMapping("/custom")
    @Operation(summary = "Kreiraj vlastitu temu sa scenarijem")
    public ResponseEntity<ApiResponse<ScenarioResponse>> createCustomTopic(@Valid @RequestBody CreateCustomTopicRequest request) {
        log.info("POST /api/topics/custom primljen: title={}, category={}, type={}",
                request.getTitle(), request.getCategoryTitle(), request.getInterlocutorType());
        try {
            ScenarioResponse result = topicService.createCustomTopic(request);
            log.info("POST /api/topics/custom uspješan: scenarioId={}", result.getId());
            return ResponseEntity.ok(ApiResponse.ok("Vlastita tema kreirana", result));
        } catch (Exception e) {
            log.error("POST /api/topics/custom greška: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Dohvati temu po ID-u")
    public ResponseEntity<ApiResponse<TopicResponse>> getTopicById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(topicService.getTopicById(id)));
    }

    @PostMapping
    @Operation(summary = "Kreiraj novu temu")
    public ResponseEntity<ApiResponse<TopicResponse>> createTopic(@Valid @RequestBody CreateTopicRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Tema kreirana", topicService.createTopic(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Ažuriraj temu")
    public ResponseEntity<ApiResponse<TopicResponse>> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody CreateTopicRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Tema ažurirana", topicService.updateTopic(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Obriši temu")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.ok(ApiResponse.ok("Tema obrisana"));
    }
}
