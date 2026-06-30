package com.persuasioncoach.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "scenarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterlocutorType interlocutorType;

    @Column(columnDefinition = "TEXT")
    private String interlocutorProfile;

    @Column(columnDefinition = "TEXT")
    private String customContext;

    @Builder.Default
    private boolean active = true;

    public enum InterlocutorType {
        SKEPTICAL_FRIEND, AUTHORITY, PARENT, STRANGER, DEBATER,
        FRIEND, SKEPTIC, AUDIENCE
    }
}
