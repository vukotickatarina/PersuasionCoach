package com.persuasioncoach.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "conversation_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "scenario_id", nullable = true)
    private Scenario scenario;

    @CreationTimestamp
    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    @Builder.Default
    private Integer durationSeconds = 0;

    @Builder.Default
    private Integer messageCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.IN_PROGRESS;

    @Builder.Default
    private String mode = "ATTACKER";

    private String debateTopic;

    public enum Status {
        IN_PROGRESS, COMPLETED, PAUSED
    }
}
