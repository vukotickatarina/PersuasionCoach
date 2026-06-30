package com.persuasioncoach.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendMessageRequest {
    @NotBlank(message = "Sadržaj poruke je obavezan")
    private String content;
}
