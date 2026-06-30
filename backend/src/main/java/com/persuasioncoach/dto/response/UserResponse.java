package com.persuasioncoach.dto.response;

import com.persuasioncoach.entity.User;
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
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private User.ExperienceLevel experienceLevel;
    private List<String> interests;
    private String language;
    private LocalDateTime createdAt;
    private boolean notificationsEnabled;
    private boolean notifyReminders;
    private boolean notifyResults;
    private boolean notifyTips;
    private boolean notifySystem;
    private String privacySettings;
    private User.Role role;
}
