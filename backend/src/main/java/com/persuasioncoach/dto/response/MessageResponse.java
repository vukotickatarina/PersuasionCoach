package com.persuasioncoach.dto.response;

import com.persuasioncoach.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long sessionId;
    private String content;
    private Message.Sender sender;
    private LocalDateTime timestamp;
}
