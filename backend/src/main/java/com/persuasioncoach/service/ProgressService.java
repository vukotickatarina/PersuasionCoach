package com.persuasioncoach.service;

import com.persuasioncoach.dto.response.ProgressOverviewResponse;
import com.persuasioncoach.entity.Analysis;
import com.persuasioncoach.entity.ConversationSession;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.repository.AnalysisRepository;
import com.persuasioncoach.repository.ConversationSessionRepository;
import com.persuasioncoach.repository.ProgressReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ConversationSessionRepository sessionRepository;
    private final ProgressReportRepository progressReportRepository;
    private final AnalysisRepository analysisRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public ProgressOverviewResponse getOverview(String email) {
        User user = userService.findByEmail(email);
        List<ConversationSession> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());

        List<Long> sessionIds = sessions.stream().map(ConversationSession::getId).toList();
        List<Analysis> analyses = sessionIds.isEmpty()
                ? List.of()
                : analysisRepository.findAllById(sessionIds.stream()
                        .map(id -> analysisRepository.findBySessionId(id).map(Analysis::getId).orElse(null))
                        .filter(Objects::nonNull)
                        .toList());

        List<ProgressOverviewResponse.DayScore> timeline = buildTimeline(sessions, analyses);
        Map<String, Integer> byTopic = buildByTopic(sessions);
        Map<String, Integer> skillLevels = buildSkillLevels(analyses);
        double overall = analyses.isEmpty() ? 0 : analyses.stream()
                .mapToDouble(a -> (a.getArgumentClarity() + a.getPersuasiveness() +
                                   a.getInterlocutorAdaptation() + a.getLogicScore()) / 4.0)
                .average()
                .orElse(0);

        return ProgressOverviewResponse.builder()
                .timeline(timeline)
                .byTopic(byTopic)
                .skillLevels(skillLevels)
                .overallProgress(overall)
                .build();
    }

    @Transactional(readOnly = true)
    public ProgressOverviewResponse getTimeline(String email) {
        return getOverview(email);
    }

    @Transactional(readOnly = true)
    public Map<String, Integer> getByTopic(String email) {
        User user = userService.findByEmail(email);
        List<ConversationSession> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());
        return buildByTopic(sessions);
    }

    @Transactional(readOnly = true)
    public String generateReport(String email) {
        User user = userService.findByEmail(email);
        long completed = sessionRepository.countCompletedByUserId(user.getId());
        return "Ukupno završenih sesija: " + completed;
    }

    @Transactional(readOnly = true)
    public byte[] downloadReportPdf(String email) {
        User user = userService.findByEmail(email);
        long completed = sessionRepository.countCompletedByUserId(user.getId());
        Double avgScore = sessionRepository.avgScoreByUserId(user.getId());

        try {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            com.itextpdf.kernel.pdf.PdfDocument pdfDoc = new com.itextpdf.kernel.pdf.PdfDocument(
                    new com.itextpdf.kernel.pdf.PdfWriter(baos));
            com.itextpdf.layout.Document doc = new com.itextpdf.layout.Document(pdfDoc);

            doc.add(new com.itextpdf.layout.element.Paragraph("Persuasion Coach — Izvještaj napretka")
                    .setFontSize(20));
            doc.add(new com.itextpdf.layout.element.Paragraph("Korisnik: " + user.getName()));
            doc.add(new com.itextpdf.layout.element.Paragraph("Završene sesije: " + completed));
            doc.add(new com.itextpdf.layout.element.Paragraph(
                    "Prosječan rezultat: " + (avgScore != null ? String.format("%.1f%%", avgScore) : "N/A")));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Greška pri generisanju PDF-a", e);
        }
    }

    private List<ProgressOverviewResponse.DayScore> buildTimeline(
            List<ConversationSession> sessions, List<Analysis> analyses) {

        if (sessions.isEmpty()) {
            String[] days = {"Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"};
            return Arrays.stream(days)
                    .map(d -> ProgressOverviewResponse.DayScore.builder().day(d).score(0).build())
                    .toList();
        }

        Map<Long, Analysis> analysisMap = analyses.stream()
                .collect(Collectors.toMap(a -> a.getSession().getId(), a -> a));

        Map<String, List<Double>> byDay = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd.MM");

        for (ConversationSession s : sessions) {
            if (s.getStartedAt() == null) continue;
            String day = s.getStartedAt().format(fmt);
            Analysis a = analysisMap.get(s.getId());
            if (a != null) {
                double avg = (a.getArgumentClarity() + a.getPersuasiveness() +
                              a.getInterlocutorAdaptation() + a.getLogicScore()) / 4.0;
                byDay.computeIfAbsent(day, k -> new ArrayList<>()).add(avg);
            }
        }

        return byDay.entrySet().stream()
                .limit(7)
                .map(e -> ProgressOverviewResponse.DayScore.builder()
                        .day(e.getKey())
                        .score(e.getValue().stream().mapToDouble(d -> d).average().orElse(0))
                        .build())
                .toList();
    }

    private Map<String, Integer> buildByTopic(List<ConversationSession> sessions) {
        Map<String, Integer> map = new LinkedHashMap<>();
        for (ConversationSession s : sessions) {
            if (s.getScenario() == null || s.getScenario().getTopic() == null) continue;
            String topic = s.getScenario().getTopic().getTitle();
            map.merge(topic, 1, Integer::sum);
        }
        return map;
    }

    private Map<String, Integer> buildSkillLevels(List<Analysis> analyses) {
        if (analyses.isEmpty()) {
            Map<String, Integer> map = new LinkedHashMap<>();
            map.put("Argumentacija", 1);
            map.put("Empatija", 1);
            map.put("Retorika", 1);
            return map;
        }

        int avgArg = (int) analyses.stream().mapToInt(Analysis::getArgumentClarity).average().orElse(1);
        int avgEmp = (int) analyses.stream().mapToInt(Analysis::getPersuasiveness).average().orElse(1);
        int avgRet = (int) analyses.stream().mapToInt(Analysis::getLogicScore).average().orElse(1);

        Map<String, Integer> map = new LinkedHashMap<>();
        map.put("Argumentacija", Math.max(1, avgArg / 10));
        map.put("Empatija", Math.max(1, avgEmp / 10));
        map.put("Retorika", Math.max(1, avgRet / 10));
        return map;
    }
}
