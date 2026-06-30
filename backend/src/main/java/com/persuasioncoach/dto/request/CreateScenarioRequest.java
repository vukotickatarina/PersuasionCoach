package com.persuasioncoach.dto.request;

import com.persuasioncoach.entity.Scenario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateScenarioRequest {
    @NotNull(message = "ID teme je obavezan")
    private Long topicId;

    @NotBlank(message = "Naziv scenarija je obavezan")
    private String title;

    private String description;

    @NotNull(message = "Tip sagovornika je obavezan")
    private Scenario.InterlocutorType interlocutorType;

    private String interlocutorProfile;
}
