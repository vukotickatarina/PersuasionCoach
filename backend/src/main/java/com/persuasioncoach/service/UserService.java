package com.persuasioncoach.service;

import com.persuasioncoach.dto.request.UpdateUserRequest;
import com.persuasioncoach.dto.response.BadgeResponse;
import com.persuasioncoach.dto.response.StatsResponse;
import com.persuasioncoach.dto.response.UserResponse;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.entity.UserBadge;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.ConversationSessionRepository;
import com.persuasioncoach.repository.UserBadgeRepository;
import com.persuasioncoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ConversationSessionRepository conversationSessionRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = findByEmail(email);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateUser(String email, UpdateUserRequest request) {
        User user = findByEmail(email);

        if (request.getName() != null) user.setName(request.getName());
        if (request.getExperienceLevel() != null) user.setExperienceLevel(request.getExperienceLevel());
        if (request.getInterests() != null) {
            user.getInterests().clear();
            user.getInterests().addAll(request.getInterests());
        }
        if (request.getLanguage() != null) user.setLanguage(request.getLanguage());
        if (request.getNotificationsEnabled() != null) user.setNotificationsEnabled(request.getNotificationsEnabled());

        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse uploadAvatar(String email, MultipartFile file) throws IOException {
        User user = findByEmail(email);

        Path uploadPath = Paths.get(uploadDir, "avatars");
        Files.createDirectories(uploadPath);

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());

        user.setAvatarUrl("/uploads/avatars/" + filename);
        return mapToResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<BadgeResponse> getUserBadges(String email) {
        User user = findByEmail(email);
        return userBadgeRepository.findByUserIdOrderByEarnedAtDesc(user.getId()).stream()
                .map(ub -> BadgeResponse.builder()
                        .id(ub.getBadge().getId())
                        .name(ub.getBadge().getName())
                        .description(ub.getBadge().getDescription())
                        .iconUrl(ub.getBadge().getIconUrl())
                        .condition(ub.getBadge().getCondition())
                        .earned(true)
                        .earnedAt(ub.getEarnedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public StatsResponse getUserStats(String email) {
        User user = findByEmail(email);
        Long userId = user.getId();

        long totalSessions = conversationSessionRepository.countCompletedByUserId(userId);
        Double avgScore = conversationSessionRepository.avgScoreByUserId(userId);
        long badges = userBadgeRepository.findByUserIdOrderByEarnedAtDesc(userId).size();
        int level = (int) (totalSessions / 5) + 1;
        int weeklyGoal = 7;
        int weeklyCompleted = (int) Math.min(totalSessions, weeklyGoal);

        return StatsResponse.builder()
                .totalSessions(totalSessions)
                .completedSessions(totalSessions)
                .averageScore(avgScore != null ? Math.round(avgScore * 100.0) / 100.0 : 0.0)
                .totalBadges(badges)
                .level(level)
                .weeklyGoal(weeklyGoal)
                .weeklyCompleted(weeklyCompleted)
                .weeklyProgressPercent(weeklyGoal > 0 ? (weeklyCompleted * 100.0 / weeklyGoal) : 0)
                .build();
    }

    @Transactional
    public void deleteUser(String email) {
        User user = findByEmail(email);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen: " + email));
    }

    @Transactional(readOnly = true)
    public UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .experienceLevel(user.getExperienceLevel())
                .interests(user.getInterests())
                .language(user.getLanguage())
                .createdAt(user.getCreatedAt())
                .notificationsEnabled(user.isNotificationsEnabled())
                .notifyReminders(user.isNotifyReminders())
                .notifyResults(user.isNotifyResults())
                .notifyTips(user.isNotifyTips())
                .notifySystem(user.isNotifySystem())
                .privacySettings(user.getPrivacySettings())
                .role(user.getRole())
                .build();
    }
}
