package com.persuasioncoach.service;

import com.persuasioncoach.entity.ConversationSession;
import com.persuasioncoach.entity.DebateMessage;
import com.persuasioncoach.entity.DebateRoom;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.exception.BadRequestException;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.ConversationSessionRepository;
import com.persuasioncoach.repository.DebateMessageRepository;
import com.persuasioncoach.repository.DebateRoomRepository;
import com.persuasioncoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DebateService {

    private final DebateRoomRepository roomRepository;
    private final DebateMessageRepository messageRepository;
    private final ConversationSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final AnthropicService anthropicService;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public DebateRoom createRoom(Long userId, String username, String topic) {
        String code = generateUniqueCode();
        log.info("createRoom: userId={}, username={}, topic={}, code={}", userId, username, topic, code);
        DebateRoom room = DebateRoom.builder()
                .code(code)
                .topic(topic)
                .createdByUserId(userId)
                .createdByUsername(username)
                .build();
        DebateRoom saved = roomRepository.save(room);
        log.info("createRoom: soba sačuvana id={}, code={}, status={}", saved.getId(), saved.getCode(), saved.getStatus());

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));
            ConversationSession session = ConversationSession.builder()
                    .user(user)
                    .scenario(null)
                    .mode("DEBATE")
                    .debateTopic(topic)
                    .build();
            ConversationSession savedSession = sessionRepository.save(session);
            saved.setSessionId(savedSession.getId());
            saved = roomRepository.save(saved);
            log.info("createRoom: ConversationSession kreiran id={} za debate sobu {}", savedSession.getId(), code);
        } catch (Exception e) {
            log.error("createRoom: GREŠKA pri kreiranju ConversationSession (soba ipak kreirana): {}", e.getMessage(), e);
        }

        return saved;
    }

    @Transactional
    public DebateRoom joinRoom(String code, Long userId, String username) {
        log.info("joinRoom: code='{}', userId={}, username={}", code, userId, username);
        DebateRoom room = findByCode(code);
        log.info("joinRoom: soba pronađena id={}, status={}, createdByUserId={}", room.getId(), room.getStatus(), room.getCreatedByUserId());

        if (room.getCreatedByUserId().equals(userId)) {
            log.warn("joinRoom: kreator {} pokušava ući u sopstvenu sobu", userId);
            throw new BadRequestException("Ne možete se pridružiti sopstvenoj sobi — pošaljite kod prijatelju");
        }
        if (room.getStatus() == DebateRoom.Status.ACTIVE) {
            log.warn("joinRoom: soba {} je već aktivna (u toku debata)", code);
            throw new BadRequestException("Soba je već aktivna — debata je u toku");
        }
        if (room.getStatus() == DebateRoom.Status.COMPLETED) {
            log.warn("joinRoom: soba {} je završena", code);
            throw new BadRequestException("Debata u ovoj sobi je već završena");
        }
        if (room.getStatus() != DebateRoom.Status.WAITING) {
            log.warn("joinRoom: soba {} ima neočekivani status {}", code, room.getStatus());
            throw new BadRequestException("Soba nije dostupna za pridruživanje (status: " + room.getStatus() + ")");
        }

        room.setJoinedUserId(userId);
        room.setJoinedUsername(username);
        room.setStatus(DebateRoom.Status.ACTIVE);
        DebateRoom saved = roomRepository.save(room);
        log.info("joinRoom: uspješno pridružen sobi {}, novi status={}", code, saved.getStatus());

        try {
            User joiner = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));
            ConversationSession joinerSession = ConversationSession.builder()
                    .user(joiner)
                    .scenario(null)
                    .mode("DEBATE")
                    .debateTopic(saved.getTopic())
                    .build();
            ConversationSession savedJoinerSession = sessionRepository.save(joinerSession);
            saved.setJoinedSessionId(savedJoinerSession.getId());
            saved = roomRepository.save(saved);
            log.info("joinRoom: ConversationSession kreiran id={} za joinera userId={}", savedJoinerSession.getId(), userId);
        } catch (Exception e) {
            log.error("joinRoom: GREŠKA pri kreiranju ConversationSession za joinera (join ipak sačuvan): {}", e.getMessage(), e);
        }

        return saved;
    }

    @Transactional
    public DebateMessage sendMessage(String code, Long userId, String username, String content) {
        DebateRoom room = findByCode(code);
        if (room.getStatus() != DebateRoom.Status.ACTIVE) {
            throw new BadRequestException("Debata nije aktivna");
        }

        DebateMessage message = DebateMessage.builder()
                .room(room)
                .userId(userId)
                .username(username)
                .content(content)
                .aiComment(false)
                .build();
        return messageRepository.save(message);
    }

    @Transactional
    public DebateRoom endDebate(String code) {
        DebateRoom room = findByCode(code);
        if (room.getStatus() != DebateRoom.Status.ACTIVE) {
            throw new BadRequestException("Debata nije aktivna");
        }

        List<DebateMessage> messages = messageRepository.findByRoomCodeOrderByTimestampAsc(code);
        List<DebateMessage> userMessages = messages.stream()
                .filter(m -> !m.isAiComment())
                .collect(Collectors.toList());

        if (userMessages.isEmpty()) {
            room.setStatus(DebateRoom.Status.COMPLETED);
            room.setEndedAt(LocalDateTime.now());
            room.setAiAnalysis("Debata je završena bez poruka.");
            room.setWinner(null);
            DebateRoom emptyFinished = roomRepository.save(room);
            completeSession(emptyFinished.getSessionId(), emptyFinished.getEndedAt(), "kreator");
            completeSession(emptyFinished.getJoinedSessionId(), emptyFinished.getEndedAt(), "joiner");
            return emptyFinished;
        }

        // Build numbered transcript with speaker labels
        AtomicInteger counter = new AtomicInteger(1);
        String transcript = userMessages.stream()
                .map(m -> counter.getAndIncrement() + ". " + m.getUsername() + ": " + m.getContent())
                .collect(Collectors.joining("\n\n"));

        String analysis = anthropicService.declareDebateWinner(room.getTopic(), transcript);

        // Extract winner name from "POBJEDNIK: [name]" line
        String winner = null;
        if (analysis.contains("POBJEDNIK:")) {
            int idx = analysis.indexOf("POBJEDNIK:") + 10;
            int end = analysis.indexOf('\n', idx);
            if (end == -1) end = analysis.length();
            winner = analysis.substring(idx, end).trim();
        }

        room.setStatus(DebateRoom.Status.COMPLETED);
        room.setEndedAt(LocalDateTime.now());
        room.setAiAnalysis(analysis);
        room.setWinner(winner);
        log.info("endDebate: soba {} završena, pobjednik='{}'", code, winner);
        DebateRoom finished = roomRepository.save(room);

        completeSession(finished.getSessionId(), finished.getEndedAt(), "kreator");
        completeSession(finished.getJoinedSessionId(), finished.getEndedAt(), "joiner");

        return finished;
    }

    @Transactional(readOnly = true)
    public List<DebateMessage> getMessages(String code) {
        return messageRepository.findByRoomCodeOrderByTimestampAsc(code);
    }

    @Transactional(readOnly = true)
    public DebateRoom getRoom(String code) {
        return findByCode(code);
    }

    private void completeSession(Long sessionId, LocalDateTime endedAt, String label) {
        if (sessionId == null) return;
        try {
            sessionRepository.findById(sessionId).ifPresent(session -> {
                session.setStatus(ConversationSession.Status.COMPLETED);
                session.setEndedAt(endedAt);
                if (session.getStartedAt() != null) {
                    long secs = Duration.between(session.getStartedAt(), endedAt).getSeconds();
                    session.setDurationSeconds((int) secs);
                }
                sessionRepository.save(session);
                log.info("endDebate: ConversationSession {} ({}) ažurirana na COMPLETED", sessionId, label);
            });
        } catch (Exception e) {
            log.error("endDebate: GREŠKA pri ažuriranju ConversationSession {} ({}): {}", sessionId, label, e.getMessage(), e);
        }
    }

    private DebateRoom findByCode(String code) {
        return roomRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Soba sa kodom '" + code + "' nije pronađena"));
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = String.format("%06d", random.nextInt(1000000));
        } while (roomRepository.findByCode(code).isPresent());
        return code;
    }
}
