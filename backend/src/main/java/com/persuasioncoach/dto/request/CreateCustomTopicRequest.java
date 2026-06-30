package com.persuasioncoach.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomTopicRequest {

    @NotBlank(message = "Naziv teme je obavezan")
    private String title;

    private String description;

    @NotBlank(message = "Kategorija je obavezna")
    private String categoryTitle;

    @NotBlank(message = "Tip sagovornika je obavezan")
    private String interlocutorType;

    private String customContext;
}
