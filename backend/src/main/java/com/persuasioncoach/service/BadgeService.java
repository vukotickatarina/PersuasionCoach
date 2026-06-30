package com.persuasioncoach.service;

import com.persuasioncoach.dto.response.BadgeResponse;
import com.persuasioncoach.entity.Badge;
import com.persuasioncoach.entity.Notification;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.entity.UserBadge;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.BadgeRepository;
import com.persuasioncoach.repository.ConversationSessionRepository;
import com.persuasioncoach.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ConversationSessionRepository sessionRepository;
    private final NotificationService notificationService;

    public List<BadgeResponse> getAllBadges(String email, Long userId) {
        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdOrderByEarnedAtDesc(userId);

        return allBadges.stream().map(badge -> {
            UserBadge earned = userBadges.stream()
                    .filter(ub -> ub.getBadge().getId().equals(badge.getId()))
                    .findFirst()
                    .orElse(null);
            return BadgeResponse.builder()
                    .id(badge.getId())
                    .name(badge.getName())
                    .description(badge.getDescription())
                    .iconUrl(badge.getIconUrl())
                    .condition(badge.getCondition())
                    .earned(earned != null)
                    .earnedAt(earned != null ? earned.getEarnedAt() : null)
                    .build();
        }).toList();
    }

    public BadgeResponse getBadgeById(Long id) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Značka nije pronađena"));
        return BadgeResponse.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                .condition(badge.getCondition())
                .earned(false)
                .build();
    }

    @Transactional
    public void checkAndAwardBadges(User user) {
        long completed = sessionRepository.countCompletedByUserId(user.getId());

        awardIfNotEarned(user, "Prva vježba", completed >= 1);
        awardIfNotEarned(user, "10 vježbi", completed >= 10);
        awardIfNotEarned(user, "25 vježbi", completed >= 25);
    }

    private void awardIfNotEarned(User user, String badgeName, boolean condition) {
        if (!condition) return;
        badgeRepository.findByName(badgeName).ifPresent(badge -> {
            if (!userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId())) {
                UserBadge ub = UserBadge.builder().user(user).badge(badge).build();
                userBadgeRepository.save(ub);
                if (user.isNotificationsEnabled() && user.isNotifySystem()) {
                    notificationService.createNotification(user, Notification.NotificationType.SYSTEM,
                            "Nova značka osvojena!",
                            "Čestitamo! Osvojili ste novu značku: " + badge.getName() + " 🏆");
                }
            }
        });
    }
}
