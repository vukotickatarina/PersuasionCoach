package com.persuasioncoach.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressOverviewResponse {
    private List<DayScore> timeline;
    private Map<String, Integer> byTopic;
    private Map<String, Integer> skillLevels;
    private double overallProgress;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayScore {
        private String day;
        private double score;
    }
}
