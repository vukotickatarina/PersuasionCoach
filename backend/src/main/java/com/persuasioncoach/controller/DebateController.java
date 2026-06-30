package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.entity.DebateMessage;
import com.persuasioncoach.entity.DebateRoom;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.UserRepository;
import com.persuasioncoach.service.DebateService;
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
@RequestMapping("/api/debate")
@RequiredArgsConstructor
@Tag(name = "Debate", description = "Dvoboj mod - debata između dva korisnika")
public class DebateController {

    private final DebateService debateService;
    private final UserRepository userRepository;

    @PostMapping("/create")
    @Operation(summary = "Kreiraj novu debatnu sobu")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRoom(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        User user = findUser(userDetails.getUsername());
        String topic = body.getOrDefault("topic", "Otvorena tema");
        DebateRoom room = debateService.createRoom(user.getId(), user.getName(), topic);
        return ResponseEntity.ok(ApiResponse.ok("Soba kreirana", Map.of(
                "code", room.getCode(),
                "topic", room.getTopic(),
                "status", room.getStatus().name(),
                "createdBy", room.getCreatedByUsername()
        )));
    }

    @PostMapping("/join/{code}")
    @Operation(summary = "Pridruži se debatnoj sobi")
    public ResponseEntity<ApiResponse<Map<String, Object>>> joinRoom(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String code) {
        User user = findUser(userDetails.getUsername());
        DebateRoom room = debateService.joinRoom(code, user.getId(), user.getName());
        return ResponseEntity.ok(ApiResponse.ok("Pridružen sobi", Map.of(
                "code", room.getCode(),
                "topic", room.getTopic(),
                "status", room.getStatus().name(),
                "createdBy", room.getCreatedByUsername(),
                "joinedBy", room.getJoinedUsername()
        )));
    }

    @GetMapping("/{code}")
    @Operation(summary = "Dohvati info o sobi")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRoom(
            @PathVariable String code) {
        DebateRoom room = debateService.getRoom(code);
        Map<String, Object> data = Map.of(
                "code", room.getCode(),
                "topic", room.getTopic(),
                "status", room.getStatus().name(),
                "createdBy", room.getCreatedByUsername(),
                "joinedBy", room.getJoinedUsername() != null ? room.getJoinedUsername() : "",
                "winner", room.getWinner() != null ? room.getWinner() : "",
                "aiAnalysis", room.getAiAnalysis() != null ? room.getAiAnalysis() : ""
        );
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/{code}/messages")
    @Operation(summary = "Dohvati sve poruke iz debate")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMessages(
            @PathVariable String code) {
        List<DebateMessage> messages = debateService.getMessages(code);
        List<Map<String, Object>> result = messages.stream().map(m -> {
            var map = new java.util.HashMap<String, Object>();
            map.put("id", m.getId());
            map.put("userId", m.getUserId());
            map.put("username", m.getUsername() != null ? m.getUsername() : "AI");
            map.put("content", m.getContent());
            map.put("aiComment", m.isAiComment());
            map.put("timestamp", m.getTimestamp() != null ? m.getTimestamp().toString() : "");
            return (Map<String, Object>) map;
        }).toList();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/{code}/end")
    @Operation(summary = "Završi debatu i proglasi pobjednika")
    public ResponseEntity<ApiResponse<Map<String, Object>>> endDebate(
            @PathVariable String code) {
        DebateRoom room = debateService.endDebate(code);
        return ResponseEntity.ok(ApiResponse.ok("Debata završena", Map.of(
                "winner", room.getWinner() != null ? room.getWinner() : "",
                "aiAnalysis", room.getAiAnalysis() != null ? room.getAiAnalysis() : ""
        )));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));
    }
}
