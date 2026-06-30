package com.persuasioncoach.service;

import com.persuasioncoach.dto.response.AnalysisResponse;
import com.persuasioncoach.dto.response.FeedbackResponse;
import com.persuasioncoach.entity.*;
import com.persuasioncoach.exception.BadRequestException;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final AnalysisRepository analysisRepository;
    private final FeedbackRepository feedbackRepository;
    private final ConversationSessionRepository sessionRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final AnthropicService anthropicService;

    @Transactional
    public AnalysisResponse generateAnalysis(String email, Long sessionId) {
        User user = userService.findByEmail(email);
        ConversationSession session = findSession(sessionId, user.getId());

        if (session.getStatus() != ConversationSession.Status.COMPLETED) {
            throw new BadRequestException("Analiza je dostupna samo za završene sesije");
        }

        if (analysisRepository.existsBySessionId(sessionId)) {
            return getAnalysis(email, sessionId);
        }

        List<Message> messages = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        Map<String, Integer> scores = scoreWithGemini(messages, session.getScenario());

        int argumentacija = scores.getOrDefault("argumentacija", 6) * 10;
        int empatija = scores.getOrDefault("empatija", 6) * 10;
        int retorika = scores.getOrDefault("retorika", 6) * 10;
        int prilagodjenost = scores.getOrDefault("prilagodjenost", 6) * 10;

        Analysis.Tone tone = deriveTone(empatija, argumentacija);

        Analysis analysis = Analysis.builder()
                .session(session)
                .argumentClarity(argumentacija)
                .persuasiveness(empatija)
                .interlocutorAdaptation(prilagodjenost)
                .logicScore(retorika)
                .tone(tone)
                .build();
        analysis = analysisRepository.save(analysis);

        List<Feedback> feedbacks = buildFeedbacks(analysis, argumentacija, empatija, prilagodjenost);
        feedbackRepository.saveAll(feedbacks);

        return mapToResponse(analysis, feedbacks);
    }

    @Transactional(readOnly = true)
    public AnalysisResponse getAnalysis(String email, Long sessionId) {
        User user = userService.findByEmail(email);
        findSession(sessionId, user.getId());

        Analysis analysis = analysisRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Analiza nije pronađena za ovu sesiju"));

        List<Feedback> feedbacks = feedbackRepository.findByAnalysisId(analysis.getId());
        return mapToResponse(analysis, feedbacks);
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedback(String email, Long sessionId) {
        User user = userService.findByEmail(email);
        findSession(sessionId, user.getId());

        Analysis analysis = analysisRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Analiza nije pronađena"));

        return feedbackRepository.findByAnalysisId(analysis.getId()).stream()
                .map(f -> FeedbackResponse.builder()
                        .id(f.getId())
                        .type(f.getType())
                        .text(f.getText())
                        .build())
                .toList();
    }

    private Map<String, Integer> scoreWithGemini(List<Message> messages, Scenario scenario) {
        if (messages.isEmpty()) {
            return Map.of("argumentacija", 5, "empatija", 5, "retorika", 5, "prilagodjenost", 5);
        }

        String conversationText = messages.stream()
                .map(m -> (m.getSender() == Message.Sender.USER ? "KORISNIK: " : "SAGOVORNIK: ") + m.getContent())
                .collect(Collectors.joining("\n"));

        String scenarioContext = "Tip sagovornika: " + scenario.getInterlocutorType() +
                ". Tema: " + scenario.getTopic().getTitle() +
                ". Scenarij: " + scenario.getDescription();

        return anthropicService.scoreConversation(conversationText, scenarioContext);
    }

    private Analysis.Tone deriveTone(int empatija, int argumentacija) {
        int avg = (empatija + argumentacija) / 2;
        if (avg >= 70) return Analysis.Tone.POSITIVE;
        if (avg >= 50) return Analysis.Tone.NEUTRAL;
        return Analysis.Tone.NEGATIVE;
    }

    private List<Feedback> buildFeedbacks(Analysis analysis, int argumentacija, int empatija, int prilagodjenost) {
        List<String> positives = List.of(
                "Koristite konkretne primjere i statistike koji jačaju argumentaciju",
                "Ton razgovora je bio miran i profesionalan",
                "Uspješno ste prepoznali sagovornikove argumente i odgovorili na njih",
                "Dobra struktura argumentacije — jasna i logična",
                "Jasno izražavate svoja stajališta bez agresivnosti"
        );
        List<String> improvements = List.of(
                "Empatija prema sagovorniku može biti jača — pokušajte razumjeti njihovu perspektivu",
                "Pokušajte koristiti 'mi' umjesto 'vi' u argumentima za bolji odnos",
                "Struktura argumenata bi mogla biti logičnija i preglednija",
                "Više konkretnih primjera bi ojačalo argumentaciju",
                "Aktivnije slušanje bi poboljšalo prilagođenost sagovorniku"
        );

        Random rng = new Random();
        List<Feedback> result = new java.util.ArrayList<>();

        int posCount = argumentacija >= 70 ? 3 : 2;
        int impCount = empatija < 60 ? 3 : 2;

        for (int i = 0; i < posCount; i++) {
            result.add(Feedback.builder()
                    .analysis(analysis)
                    .type(Feedback.FeedbackType.POSITIVE)
                    .text(positives.get(rng.nextInt(positives.size())))
                    .build());
        }
        for (int i = 0; i < impCount; i++) {
            result.add(Feedback.builder()
                    .analysis(analysis)
                    .type(Feedback.FeedbackType.IMPROVEMENT)
                    .text(improvements.get(rng.nextInt(improvements.size())))
                    .build());
        }
        return result;
    }

    private ConversationSession findSession(Long sessionId, Long userId) {
        ConversationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesija nije pronađena"));
        if (!session.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Sesija nije pronađena");
        }
        return session;
    }

    private AnalysisResponse mapToResponse(Analysis analysis, List<Feedback> feedbacks) {
        return AnalysisResponse.builder()
                .id(analysis.getId())
                .sessionId(analysis.getSession().getId())
                .argumentClarity(analysis.getArgumentClarity())
                .persuasiveness(analysis.getPersuasiveness())
                .tone(analysis.getTone())
                .interlocutorAdaptation(analysis.getInterlocutorAdaptation())
                .logicScore(analysis.getLogicScore())
                .createdAt(analysis.getCreatedAt())
                .feedbacks(feedbacks.stream()
                        .map(f -> FeedbackResponse.builder()
                                .id(f.getId())
                                .type(f.getType())
                                .text(f.getText())
                                .build())
                        .toList())
                .build();
    }
}
