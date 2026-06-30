package com.persuasioncoach.dto.request;

import com.persuasioncoach.entity.Topic;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTopicRequest {
    @NotBlank(message = "Naziv teme je obavezan")
    private String title;

    private String description;
    private String illustration;

    @NotNull(message = "Težina je obavezna")
    private Topic.Difficulty difficulty;

    private Boolean popular;
    private Long parentId;
}
