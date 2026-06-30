package com.persuasioncoach.dto.response;

import com.persuasioncoach.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Notification.NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}
