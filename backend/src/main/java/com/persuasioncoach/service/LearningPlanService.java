package com.persuasioncoach.service;

import com.persuasioncoach.dto.request.UpdateLearningPlanRequest;
import com.persuasioncoach.dto.response.LearningPlanResponse;
import com.persuasioncoach.entity.LearningPlan;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.repository.LearningPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class LearningPlanService {

    private final LearningPlanRepository learningPlanRepository;
    private final UserService userService;

    public LearningPlanResponse getLearningPlan(String email) {
        User user = userService.findByEmail(email);
        LearningPlan plan = learningPlanRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPlan(user));
        return mapToResponse(plan);
    }

    @Transactional
    public LearningPlanResponse updateLearningPlan(String email, UpdateLearningPlanRequest request) {
        User user = userService.findByEmail(email);
        LearningPlan plan = learningPlanRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPlan(user));

        if (request.getType() != null) plan.setType(request.getType());
        if (request.getTasks() != null) plan.setTasks(request.getTasks());
        if (request.getStartDate() != null) plan.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) plan.setEndDate(request.getEndDate());

        return mapToResponse(learningPlanRepository.save(plan));
    }

    public String getNextExercise(String email) {
        return "Vježba argumentacije - Fokus na jasnoću";
    }

    private LearningPlan createDefaultPlan(User user) {
        LearningPlan plan = LearningPlan.builder()
                .user(user)
                .type(LearningPlan.PlanType.DAILY)
                .tasks("[{\"title\":\"Vježba argumentacije\",\"time\":\"09:00\",\"duration\":\"15 min\"}," +
                       "{\"title\":\"Simulacija debate\",\"time\":\"14:00\",\"duration\":\"20 min\"}," +
                       "{\"title\":\"Analiza govora\",\"time\":\"19:00\",\"duration\":\"10 min\"}]")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(7))
                .build();
        return learningPlanRepository.save(plan);
    }

    private LearningPlanResponse mapToResponse(LearningPlan plan) {
        return LearningPlanResponse.builder()
                .id(plan.getId())
                .type(plan.getType())
                .tasks(plan.getTasks())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .build();
    }
}
