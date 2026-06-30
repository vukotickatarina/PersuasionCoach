package com.persuasioncoach.dto.request;

import com.persuasioncoach.entity.User;
import lombok.Data;

import java.util.List;

@Data
public class UpdateUserRequest {
    private String name;
    private User.ExperienceLevel experienceLevel;
    private List<String> interests;
    private String language;
    private Boolean notificationsEnabled;
}
