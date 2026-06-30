package com.persuasioncoach.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private long totalSessions;
    private long completedSessions;
    private Double averageScore;
    private long totalBadges;
    private int level;
    private double weeklyProgressPercent;
    private int weeklyGoal;
    private int weeklyCompleted;
}
