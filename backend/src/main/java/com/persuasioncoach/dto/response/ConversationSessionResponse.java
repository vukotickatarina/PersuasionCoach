package com.persuasioncoach.dto.response;

import com.persuasioncoach.entity.ConversationSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSessionResponse {
    private Long id;
    private Long userId;
    private ScenarioResponse scenario;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer durationSeconds;
    private Integer messageCount;
    private ConversationSession.Status status;
    private String mode;
    private String debateTopic;
    private List<MessageResponse> messages;
}
