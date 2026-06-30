package com.persuasioncoach.dto.response;

import com.persuasioncoach.entity.Scenario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioResponse {
    private Long id;
    private Long topicId;
    private String topicTitle;
    private String title;
    private String description;
    private Scenario.InterlocutorType interlocutorType;
    private String interlocutorProfile;
    private boolean active;
}
