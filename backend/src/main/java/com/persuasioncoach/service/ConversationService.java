package com.persuasioncoach.service;

import com.persuasioncoach.dto.request.SendMessageRequest;
import com.persuasioncoach.dto.request.StartConversationRequest;
import com.persuasioncoach.dto.response.ConversationSessionResponse;
import com.persuasioncoach.dto.response.MessageResponse;
import com.persuasioncoach.entity.*;
import com.persuasioncoach.entity.Notification;
import com.persuasioncoach.exception.BadRequestException;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.ConversationSessionRepository;
import com.persuasioncoach.repository.MessageRepository;
import com.persuasioncoach.repository.ScenarioRepository;
import com.persuasioncoach.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationSessionRepository sessionRepository;
    private final MessageRepository messageRepository;
    private final ScenarioService scenarioService;
    private final ScenarioRepository scenarioRepository;
    private final TopicRepository topicRepository;
    private final UserService userService;
    private final AnthropicService anthropicService;
    private final BadgeService badgeService;
    private final NotificationService notificationService;

    @Transactional
    public ConversationSessionResponse startConversation(String email, StartConversationRequest request) {
        log.info("=== startConversation START === email={}, scenarioId={}, topicTitle='{}', interlocutorType={}, mode={}",
            email, request.getScenarioId(), request.getTopicTitle(), request.getInterlocutorType(), request.getMode());
        try {
            User user = userService.findByEmail(email);
            log.info("startConversation: korisnik pronađen userId={}", user.getId());

            Scenario scenario;
            if (request.getScenarioId() != null) {
                scenario = scenarioService.findById(request.getScenarioId());
                log.info("startConversation: učitan postojeći scenarioId={}", scenario.getId());
            } else if (request.getTopicTitle() != null && request.getInterlocutorType() != null) {
                scenario = resolveOrCreateScenario(request);
                log.info("startConversation: scenario resolved/created, id={}, topic='{}'",
                    scenario.getId(), scenario.getTopic().getTitle());
            } else {
                throw new BadRequestException("Potreban je scenarioId ili topicTitle + interlocutorType");
            }

            ConversationSession session = ConversationSession.builder()
                    .user(user)
                    .scenario(scenario)
                    .build();
            log.info("startConversation: pozivam sessionRepository.save()...");
            session = sessionRepository.save(session);
            if (session.getId() == null) {
                log.error("startConversation: CRITICAL - session.getId() je null nakon save()!");
            } else {
                log.info("startConversation: session SAVED OK, id={}, status={}", session.getId(), session.getStatus());
            }

            String aiGreeting = buildGreeting(scenario);
            log.info("startConversation: greeting generisan ({} znakova)", aiGreeting.length());

            Message greeting = Message.builder()
                    .session(session)
                    .content(aiGreeting)
                    .sender(Message.Sender.AI)
                    .build();
            greeting = messageRepository.save(greeting);
            log.info("startConversation: greeting poruka SAVED, messageId={}", greeting.getId());

            session.setMessageCount(1);
            session = sessionRepository.save(session);
            log.info("startConversation: session UPDATE OK, id={}, messageCount={}", session.getId(), session.getMessageCount());

            log.info("=== startConversation SUCCESS === sessionId={}", session.getId());
            return mapToResponse(session, List.of(mapMessageToResponse(greeting)));

        } catch (Exception e) {
            log.error("=== startConversation FAILED === {}: {}", e.getClass().getSimpleName(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public List<MessageResponse> sendMessage(String email, Long sessionId, SendMessageRequest request) {
        log.info("=== sendMessage START === sessionId={}, email={}", sessionId, email);
        try {
            User user = userService.findByEmail(email);
            ConversationSession session = findSessionByIdAndUser(sessionId, user.getId());
            log.info("sendMessage: session pronađena, status={}, messageCount={}", session.getStatus(), session.getMessageCount());

            if (session.getStatus() == ConversationSession.Status.COMPLETED) {
                throw new BadRequestException("Sesija je završena");
            }
            if (session.getStatus() == ConversationSession.Status.PAUSED) {
                throw new BadRequestException("Sesija je pauzirana. Nastavite sesiju prije slanja poruke");
            }

            List<Message> history = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
            log.info("sendMessage: historija učitana, {} poruka", history.size());

            Message userMessage = Message.builder()
                    .session(session)
                    .content(request.getContent())
                    .sender(Message.Sender.USER)
                    .build();
            userMessage = messageRepository.save(userMessage);
            log.info("sendMessage: user poruka SAVED, id={}", userMessage.getId());

            String context = anthropicService.buildInterlocutorContext(session.getScenario());
            log.info("sendMessage: context izgrađen ({} znakova), pozivam AI...", context.length());
            String aiReply = anthropicService.sendMessageWithHistory(request.getContent(), context, history);
            log.info("sendMessage: AI odgovor primljen ({} znakova)", aiReply.length());

            Message aiMessage = Message.builder()
                    .session(session)
                    .content(aiReply)
                    .sender(Message.Sender.AI)
                    .build();
            aiMessage = messageRepository.save(aiMessage);
            log.info("sendMessage: AI poruka SAVED, id={}", aiMessage.getId());

            session.setMessageCount(session.getMessageCount() + 2);
            session = sessionRepository.save(session);
            log.info("sendMessage: session UPDATE OK, messageCount={}", session.getMessageCount());

            log.info("=== sendMessage SUCCESS === sessionId={}", sessionId);
            return List.of(mapMessageToResponse(userMessage), mapMessageToResponse(aiMessage));

        } catch (Exception e) {
            log.error("=== sendMessage FAILED === sessionId={}, {}: {}", sessionId, e.getClass().getSimpleName(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public List<MessageResponse> sendMentorMessage(String email, Long sessionId, SendMessageRequest request) {
        User user = userService.findByEmail(email);
        ConversationSession session = findSessionByIdAndUser(sessionId, user.getId());

        if (session.getStatus() == ConversationSession.Status.COMPLETED) {
            throw new BadRequestException("Sesija je završena");
        }
        if (session.getStatus() == ConversationSession.Status.PAUSED) {
            throw new BadRequestException("Sesija je pauzirana. Nastavite sesiju prije slanja poruke");
        }

        List<Message> history = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);

        Message userMessage = Message.builder()
                .session(session)
                .content(request.getContent())
                .sender(Message.Sender.USER)
                .build();
        messageRepository.save(userMessage);

        String scenarioContext = anthropicService.buildInterlocutorContext(session.getScenario());
        String mentorAdvice = anthropicService.getMentorAdvice(request.getContent(), scenarioContext, history);

        Message aiMessage = Message.builder()
                .session(session)
                .content(mentorAdvice)
                .sender(Message.Sender.AI)
                .build();
        messageRepository.save(aiMessage);

        session.setMessageCount(session.getMessageCount() + 2);
        sessionRepository.save(session);

        return List.of(mapMessageToResponse(userMessage), mapMessageToResponse(aiMessage));
    }

    @Transactional
    public ConversationSessionResponse pauseSession(String email, Long sessionId) {
        User user = userService.findByEmail(email);
        ConversationSession session = findSessionByIdAndUser(sessionId, user.getId());

        if (session.getStatus() != ConversationSession.Status.IN_PROGRESS) {
            throw new BadRequestException("Sesija nije aktivna");
        }

        session.setStatus(ConversationSession.Status.PAUSED);
        return mapToResponse(sessionRepository.save(session), List.of());
    }

    @Transactional
    public ConversationSessionResponse endSession(String email, Long sessionId) {
        log.info("=== endSession START === sessionId={}, email={}", sessionId, email);
        try {
            User user = userService.findByEmail(email);
            ConversationSession session = findSessionByIdAndUser(sessionId, user.getId());
            log.info("endSession: session pronađena, status={}", session.getStatus());

            session.setStatus(ConversationSession.Status.COMPLETED);
            session.setEndedAt(LocalDateTime.now());

            if (session.getStartedAt() != null) {
                long seconds = java.time.Duration.between(session.getStartedAt(), session.getEndedAt()).getSeconds();
                session.setDurationSeconds((int) seconds);
                log.info("endSession: trajanje={}s", seconds);
            }

            session = sessionRepository.save(session);
            log.info("endSession: session SAVED, id={}, status={}", session.getId(), session.getStatus());

            try {
                badgeService.checkAndAwardBadges(user);
                log.info("endSession: badge provjera završena");
            } catch (Exception e) {
                log.error("endSession: GREŠKA u badgeService (sesija ipak spašena): {}", e.getMessage(), e);
            }

            try {
                if (user.isNotificationsEnabled() && user.isNotifyResults()) {
                    notificationService.createNotification(user, Notification.NotificationType.RESULT,
                            "Vježba završena!",
                            "Vježba završena! Pogledaj analizu #" + session.getId());
                    log.info("endSession: notifikacija kreirana");
                }
            } catch (Exception e) {
                log.error("endSession: GREŠKA u notificationService (sesija ipak spašena): {}", e.getMessage(), e);
            }

            log.info("=== endSession SUCCESS === sessionId={}", session.getId());
            return mapToResponse(session, List.of());

        } catch (Exception e) {
            log.error("=== endSession FAILED === sessionId={}, {}: {}", sessionId, e.getClass().getSimpleName(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public ConversationSessionResponse getSession(String email, Long sessionId) {
        User user = userService.findByEmail(email);
        ConversationSession session = findSessionByIdAndUser(sessionId, user.getId());
        List<Message> messages = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        return mapToResponse(session, messages.stream().map(this::mapMessageToResponse).toList());
    }

    @Transactional(readOnly = true)
    public List<ConversationSessionResponse> getHistory(String email) {
        User user = userService.findByEmail(email);
        return sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId()).stream()
                .map(s -> mapToResponse(s, List.of()))
                .toList();
    }

    private ConversationSession findSessionByIdAndUser(Long sessionId, Long userId) {
        ConversationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesija nije pronađena"));
        if (!session.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Sesija nije pronađena");
        }
        return session;
    }

    private Scenario resolveOrCreateScenario(StartConversationRequest request) {
        String topicTitle = request.getTopicTitle();
        if (topicTitle == null || topicTitle.isBlank()) {
            throw new BadRequestException("topicTitle ne smije biti prazan");
        }
        Scenario.InterlocutorType iType = parseInterlocutorType(request.getInterlocutorType());
        boolean hasCustomContext = request.getCustomContext() != null && !request.getCustomContext().isBlank();
        log.info("resolveOrCreateScenario: topicTitle='{}', iType={}, hasCustomContext={}", topicTitle, iType, hasCustomContext);

        if (!hasCustomContext) {
            Optional<Scenario> existing = scenarioRepository
                    .findFirstByTopic_TitleIgnoreCaseAndInterlocutorTypeAndActiveTrue(topicTitle, iType);
            if (existing.isPresent()) {
                log.info("resolveOrCreateScenario: nađen postojeći scenarij id={}", existing.get().getId());
                return existing.get();
            }
            log.info("resolveOrCreateScenario: nije nađen postojeći scenarij, kreiram novi");
        }

        Topic topic;
        Optional<Topic> existingTopic = topicRepository.findByTitleIgnoreCase(topicTitle);
        if (existingTopic.isPresent()) {
            topic = existingTopic.get();
            log.info("resolveOrCreateScenario: postojeća tema id={}, title='{}'", topic.getId(), topic.getTitle());
        } else {
            log.info("resolveOrCreateScenario: kreiram novu temu '{}'", topicTitle);
            try {
                topic = topicRepository.save(Topic.builder()
                        .title(topicTitle)
                        .description("Dinamički kreirana tema")
                        .difficulty(Topic.Difficulty.MEDIUM)
                        .build());
                log.info("resolveOrCreateScenario: nova tema SAVED, id={}", topic.getId());
            } catch (Exception e) {
                log.error("resolveOrCreateScenario: GREŠKA pri save teme '{}': {} - {}", topicTitle, e.getClass().getSimpleName(), e.getMessage(), e);
                throw e;
            }
        }

        log.info("resolveOrCreateScenario: kreiram scenarij za temu id={}", topic.getId());
        Scenario saved;
        try {
            saved = scenarioRepository.save(Scenario.builder()
                    .topic(topic)
                    .title(topicTitle + " — " + formatInterlocutorLabel(iType))
                    .description("Vježba uvjeravanja na temu: " + topicTitle)
                    .interlocutorType(iType)
                    .interlocutorProfile(buildDefaultProfile(iType))
                    .customContext(hasCustomContext ? request.getCustomContext() : null)
                    .build());
        } catch (Exception e) {
            log.error("resolveOrCreateScenario: GREŠKA pri save scenarija: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
            throw e;
        }

        if (saved == null || saved.getId() == null) {
            throw new BadRequestException("Greška pri kreiranju scenarija za temu: " + topicTitle);
        }
        log.info("resolveOrCreateScenario: scenarij SAVED id={}", saved.getId());
        return saved;
    }

    private Scenario.InterlocutorType parseInterlocutorType(String type) {
        try {
            return Scenario.InterlocutorType.valueOf(type.toUpperCase());
        } catch (Exception e) {
            return Scenario.InterlocutorType.STRANGER;
        }
    }

    private String formatInterlocutorLabel(Scenario.InterlocutorType type) {
        return switch (type) {
            case FRIEND, SKEPTICAL_FRIEND -> "Prijatelj";
            case PARENT -> "Roditelj";
            case AUTHORITY -> "Autoritet";
            case STRANGER -> "Stranac";
            case DEBATER -> "Debater";
            default -> type.name();
        };
    }

    private String buildDefaultProfile(Scenario.InterlocutorType type) {
        return switch (type) {
            case FRIEND, SKEPTICAL_FRIEND -> "Opušten prijatelj koji koristi humor i neformalan jezik.";
            case PARENT -> "Emotivan roditelj koji brine za dobrobit djeteta.";
            case AUTHORITY -> "Formalna i direktna osoba koja traži dokaze i logičku strukturu.";
            case STRANGER -> "Neutralna osoba bez predznanja o temi.";
            case DEBATER -> "Iskusan debater koji napada najslabiju tačku argumenta.";
            default -> "Sagovornik koji preispituje argumente.";
        };
    }

    private String buildGreeting(Scenario scenario) {
        return switch (scenario.getInterlocutorType()) {
            case AUTHORITY -> "Zdravo. Imam malo vremena. Recite mi, šta tačno želite postići?";
            case SKEPTICAL_FRIEND, FRIEND -> "Hej! Čujem te, ali moram biti iskren — nisam baš uvjeren. Šta imaš za reći?";
            case PARENT -> "Dragi, znaš da te volim i brine me samo jedno — hoće li ti biti dobro?";
            case STRANGER -> "Dobar dan. Oprostite, ne razumijem sasvim o čemu se radi. Možete li mi objasniti od početka?";
            case DEBATER -> "Zanimljivo. Spreman sam za debatu. Koji je vaš glavni argument?";
            case SKEPTIC -> "Hmm, nisam siguran da me možete uvjeriti, ali slušam. Šta imate za reći?";
            case AUDIENCE -> "Dobrodošli. Možete početi kada budete spremni.";
        };
    }

    private ConversationSessionResponse mapToResponse(ConversationSession session, List<MessageResponse> messages) {
        return ConversationSessionResponse.builder()
                .id(session.getId())
                .userId(session.getUser().getId())
                .scenario(session.getScenario() != null ? scenarioService.mapToResponse(session.getScenario()) : null)
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .durationSeconds(session.getDurationSeconds())
                .messageCount(session.getMessageCount())
                .status(session.getStatus())
                .mode(session.getMode())
                .debateTopic(session.getDebateTopic())
                .messages(messages)
                .build();
    }

    private MessageResponse mapMessageToResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .sessionId(message.getSession().getId())
                .content(message.getContent())
                .sender(message.getSender())
                .timestamp(message.getTimestamp())
                .build();
    }
}
