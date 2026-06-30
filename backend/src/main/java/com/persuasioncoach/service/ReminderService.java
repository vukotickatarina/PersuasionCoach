package com.persuasioncoach.service;

import com.persuasioncoach.dto.request.CreateReminderRequest;
import com.persuasioncoach.dto.response.ReminderResponse;
import com.persuasioncoach.entity.Reminder;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.ReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final UserService userService;

    public List<ReminderResponse> getReminders(String email) {
        User user = userService.findByEmail(email);
        return reminderRepository.findByUserIdOrderByReminderTimeAsc(user.getId()).stream()
                .map(this::mapToResponse).toList();
    }

    @Transactional
    public ReminderResponse createReminder(String email, CreateReminderRequest request) {
        User user = userService.findByEmail(email);
        Reminder reminder = Reminder.builder()
                .user(user)
                .text(request.getText())
                .reminderTime(request.getReminderTime())
                .build();
        return mapToResponse(reminderRepository.save(reminder));
    }

    @Transactional
    public ReminderResponse updateReminder(String email, Long id, CreateReminderRequest request) {
        User user = userService.findByEmail(email);
        Reminder reminder = findByIdAndUser(id, user.getId());
        if (request.getText() != null) reminder.setText(request.getText());
        if (request.getReminderTime() != null) reminder.setReminderTime(request.getReminderTime());
        return mapToResponse(reminderRepository.save(reminder));
    }

    @Transactional
    public void deleteReminder(String email, Long id) {
        User user = userService.findByEmail(email);
        Reminder reminder = findByIdAndUser(id, user.getId());
        reminderRepository.delete(reminder);
    }

    @Transactional
    public ReminderResponse toggleReminder(String email, Long id) {
        User user = userService.findByEmail(email);
        Reminder reminder = findByIdAndUser(id, user.getId());
        reminder.setActive(!reminder.isActive());
        return mapToResponse(reminderRepository.save(reminder));
    }

    private Reminder findByIdAndUser(Long id, Long userId) {
        return reminderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Podsjetnik nije pronađen"));
    }

    private ReminderResponse mapToResponse(Reminder reminder) {
        return ReminderResponse.builder()
                .id(reminder.getId())
                .text(reminder.getText())
                .reminderTime(reminder.getReminderTime())
                .active(reminder.isActive())
                .build();
    }
}
