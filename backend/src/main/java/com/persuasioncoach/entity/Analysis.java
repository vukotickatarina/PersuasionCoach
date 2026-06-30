package com.persuasioncoach.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private ConversationSession session;

    @Column(nullable = false)
    private Integer argumentClarity;

    @Column(nullable = false)
    private Integer persuasiveness;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tone tone;

    @Column(nullable = false)
    private Integer interlocutorAdaptation;

    @Column(nullable = false)
    private Integer logicScore;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Tone {
        POSITIVE, NEUTRAL, NEGATIVE
    }
}
