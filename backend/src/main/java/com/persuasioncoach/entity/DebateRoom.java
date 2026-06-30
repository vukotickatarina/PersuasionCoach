package com.persuasioncoach.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "debate_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebateRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private String topic;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.WAITING;

    private Long createdByUserId;
    private String createdByUsername;
    private Long joinedUserId;
    private String joinedUsername;

    @CreationTimestamp
    private LocalDateTime createdAt;
    private LocalDateTime endedAt;

    @Column(columnDefinition = "TEXT")
    private String aiAnalysis;
    private String winner;

    private Long sessionId;
    private Long joinedSessionId;

    public enum Status {
        WAITING, ACTIVE, COMPLETED
    }
}
