package com.persuasioncoach.dto.request;

import lombok.Data;

@Data
public class NotificationPreferencesRequest {
    private Boolean reminders;
    private Boolean results;
    private Boolean tips;
    private Boolean system;
}
