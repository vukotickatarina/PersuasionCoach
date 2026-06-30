package com.persuasioncoach.service;

import com.persuasioncoach.dto.request.NotificationPreferencesRequest;
import com.persuasioncoach.dto.response.NotificationResponse;
import com.persuasioncoach.entity.Notification;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.NotificationRepository;
import com.persuasioncoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public List<NotificationResponse> getNotifications(String email) {
        User user = userService.findByEmail(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse).toList();
    }

    @Transactional
    public NotificationResponse markAsRead(String email, Long id) {
        User user = userService.findByEmail(email);
        Notification notification = notificationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notifikacija nije pronađena"));
        notification.setRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void deleteNotification(String email, Long id) {
        User user = userService.findByEmail(email);
        Notification notification = notificationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notifikacija nije pronađena"));
        notificationRepository.delete(notification);
    }

    @Transactional
    public void updatePreferences(String email, NotificationPreferencesRequest request) {
        User user = userService.findByEmail(email);
        if (request.getReminders() != null) user.setNotifyReminders(request.getReminders());
        if (request.getResults() != null) user.setNotifyResults(request.getResults());
        if (request.getTips() != null) user.setNotifyTips(request.getTips());
        if (request.getSystem() != null) user.setNotifySystem(request.getSystem());
        userRepository.save(user);
    }

    @Transactional
    public Notification createNotification(User user, Notification.NotificationType type, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .build();
        return notificationRepository.save(notification);
    }

    /** Scheduled every day at 10:00 — send inactivity reminders to users inactive for 2+ days. */
    @Scheduled(cron = "0 0 10 * * *")
    @Transactional
    public void sendInactivityReminders() {
        LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        List<User> inactiveUsers = userRepository.findUsersWithNoRecentSession(twoDaysAgo);
        log.info("sendInactivityReminders: pronađeno {} neaktivnih korisnika", inactiveUsers.size());

        for (User user : inactiveUsers) {
            boolean alreadySent = notificationRepository.existsByUserIdAndTypeAndCreatedAtBetween(
                    user.getId(), Notification.NotificationType.REMINDER, todayStart, todayEnd);
            if (!alreadySent) {
                createNotification(user, Notification.NotificationType.REMINDER,
                        "Vrati se treningu!",
                        "Prošlo je više od 2 dana od zadnje vježbe. Vrati se treningu! 💪");
                log.info("sendInactivityReminders: poslan podsjetnik korisniku id={}", user.getId());
            }
        }
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
