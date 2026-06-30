package com.persuasioncoach.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresentationSessionResponse {
    private Long id;
    private String inputText;
    private String audioUrl;
    private String videoUrl;
    private Integer structureScore;
    private Integer clarityScore;
    private Integer persuasivenessScore;
    private LocalDateTime createdAt;
}
