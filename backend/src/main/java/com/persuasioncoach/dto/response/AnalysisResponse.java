package com.persuasioncoach.dto.response;

import com.persuasioncoach.entity.Analysis;
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
public class AnalysisResponse {
    private Long id;
    private Long sessionId;
    private Integer argumentClarity;
    private Integer persuasiveness;
    private Analysis.Tone tone;
    private Integer interlocutorAdaptation;
    private Integer logicScore;
    private LocalDateTime createdAt;
    private List<FeedbackResponse> feedbacks;
}
