package com.persuasioncoach.dto.response;

import com.persuasioncoach.entity.Topic;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponse {
    private Long id;
    private String title;
    private String description;
    private String illustration;
    private Topic.Difficulty difficulty;
    private boolean popular;
    private boolean active;
    private LocalDateTime createdAt;
    private Long parentId;
}
