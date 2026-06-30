package com.persuasioncoach.dto.response;

import com.persuasioncoach.entity.Feedback;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Feedback.FeedbackType type;
    private String text;
}
