package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.request.SendMessageRequest;
import com.persuasioncoach.dto.request.StartConversationRequest;
import com.persuasioncoach.dto.response.ConversationSessionResponse;
import com.persuasioncoach.dto.response.MessageResponse;
import com.persuasioncoach.service.ConversationService;
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
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Tag(name = "Conversations", description = "Upravljanje konverzacijskim sesijama")
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping("/start")
    @Operation(summary = "Pokreni novu konverzacijsku sesiju")
    public ResponseEntity<ApiResponse<ConversationSessionResponse>> startConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StartConversationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Sesija pokrenuta",
                conversationService.startConversation(userDetails.getUsername(), request)));
    }

    @PostMapping("/{sessionId}/message")
    @Operation(summary = "Pošalji poruku u sesiji i dohvati AI odgovor")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                conversationService.sendMessage(userDetails.getUsername(), sessionId, request)));
    }

    @PostMapping("/{sessionId}/mentor-message")
    @Operation(summary = "Pošalji poruku u mentor modu i dohvati AI savjet")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> sendMentorMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                conversationService.sendMentorMessage(userDetails.getUsername(), sessionId, request)));
    }

    @PutMapping("/{sessionId}/pause")
    @Operation(summary = "Pauziraj sesiju")
    public ResponseEntity<ApiResponse<ConversationSessionResponse>> pauseSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok("Sesija pauzirana",
                conversationService.pauseSession(userDetails.getUsername(), sessionId)));
    }

    @PutMapping("/{sessionId}/end")
    @Operation(summary = "Završi sesiju")
    public ResponseEntity<ApiResponse<ConversationSessionResponse>> endSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok("Sesija završena",
                conversationService.endSession(userDetails.getUsername(), sessionId)));
    }

    @GetMapping("/{sessionId}")
    @Operation(summary = "Dohvati sesiju sa porukama")
    public ResponseEntity<ApiResponse<ConversationSessionResponse>> getSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                conversationService.getSession(userDetails.getUsername(), sessionId)));
    }

    @GetMapping("/history")
    @Operation(summary = "Historija svih konverzacija korisnika")
    public ResponseEntity<ApiResponse<List<ConversationSessionResponse>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
                conversationService.getHistory(userDetails.getUsername())));
    }
}
