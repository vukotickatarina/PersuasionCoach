package com.persuasioncoach.controller;

import com.persuasioncoach.common.ApiResponse;
import com.persuasioncoach.dto.response.BadgeResponse;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.service.BadgeService;
import com.persuasioncoach.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
@Tag(name = "Badges", description = "Upravljanje značkama")
public class BadgeController {

    private final BadgeService badgeService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Dohvati sve značke sa statusom korisnika")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getAllBadges(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(badgeService.getAllBadges(userDetails.getUsername(), user.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Dohvati značku po ID-u")
    public ResponseEntity<ApiResponse<BadgeResponse>> getBadgeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(badgeService.getBadgeById(id)));
    }
}
