package com.persuasioncoach.dto.response;

import com.persuasioncoach.entity.LearningPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanResponse {
    private Long id;
    private LearningPlan.PlanType type;
    private String tasks;
    private LocalDate startDate;
    private LocalDate endDate;
}
