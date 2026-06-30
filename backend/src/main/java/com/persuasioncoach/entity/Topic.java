package com.persuasioncoach.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "topics")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Topic {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String title;

    @Column(columnDefinition = "TEXT") private String description;

    private String illustration;

    @Enumerated(EnumType.STRING) @Column(nullable = false) private Difficulty difficulty;

    @CreationTimestamp private LocalDateTime createdAt;

    @Builder.Default private boolean active = true;

    @Builder.Default private boolean popular = false;

    private Long parentId;

    public enum Difficulty { EASY, MEDIUM, HARD }
}
