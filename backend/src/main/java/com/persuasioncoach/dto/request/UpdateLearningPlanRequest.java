package com.persuasioncoach.dto.request;

import com.persuasioncoach.entity.LearningPlan;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateLearningPlanRequest {
    private LearningPlan.PlanType type;
    private String tasks;
    private LocalDate startDate;
    private LocalDate endDate;
}
