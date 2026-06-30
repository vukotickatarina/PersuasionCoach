package com.persuasioncoach.dto.request;

import lombok.Data;

@Data
public class StartConversationRequest {
    private Long scenarioId;
    private String topicTitle;
    private String interlocutorType;
    private String mode;
    private String customContext;
}
