package com.persuasioncoach.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ExperienceLevel experienceLevel = ExperienceLevel.BEGINNER;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    @Builder.Default
    private List<String> interests = new ArrayList<>();

    @Builder.Default
    private String language = "Bosanski";

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Builder.Default
    private boolean notificationsEnabled = true;

    @Builder.Default
    private boolean notifyReminders = true;

    @Builder.Default
    private boolean notifyResults = true;

    @Builder.Default
    private boolean notifyTips = false;

    @Builder.Default
    private boolean notifySystem = true;

    private String privacySettings;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.USER;

    public enum ExperienceLevel {
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    public enum Role {
        USER, ADMIN
    }
}
