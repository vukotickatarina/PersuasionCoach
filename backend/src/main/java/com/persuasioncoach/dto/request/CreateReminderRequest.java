package com.persuasioncoach.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class CreateReminderRequest {
    @NotBlank(message = "Tekst podsjetnika je obavezan")
    private String text;

    @NotNull(message = "Vrijeme podsjetnika je obavezno")
    private LocalTime reminderTime;
}
