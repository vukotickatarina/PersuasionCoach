package com.persuasioncoach.service;

import com.persuasioncoach.dto.request.StartPresentationRequest;
import com.persuasioncoach.dto.response.PresentationSessionResponse;
import com.persuasioncoach.entity.PresentationSession;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.PresentationSessionRepository;
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
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PresentationService {

    private final PresentationSessionRepository presentationRepository;
    private final UserService userService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional
    public PresentationSessionResponse startPresentation(String email, StartPresentationRequest request) {
        User user = userService.findByEmail(email);
        PresentationSession session = PresentationSession.builder()
                .user(user)
                .inputText(request.getInputText())
                .build();
        return mapToResponse(presentationRepository.save(session));
    }

    @Transactional
    public PresentationSessionResponse uploadAudio(String email, Long id, MultipartFile file) throws IOException {
        User user = userService.findByEmail(email);
        PresentationSession session = findByIdAndUser(id, user.getId());

        String url = saveFile(file, "audio");
        session.setAudioUrl(url);

        if (session.getStructureScore() == null) {
            generateScores(session);
        }

        return mapToResponse(presentationRepository.save(session));
    }

    @Transactional
    public PresentationSessionResponse uploadVideo(String email, Long id, MultipartFile file) throws IOException {
        User user = userService.findByEmail(email);
        PresentationSession session = findByIdAndUser(id, user.getId());

        String url = saveFile(file, "video");
        session.setVideoUrl(url);

        if (session.getStructureScore() == null) {
            generateScores(session);
        }

        return mapToResponse(presentationRepository.save(session));
    }

    public PresentationSessionResponse getPresentation(String email, Long id) {
        User user = userService.findByEmail(email);
        return mapToResponse(findByIdAndUser(id, user.getId()));
    }

    public List<PresentationSessionResponse> getHistory(String email) {
        User user = userService.findByEmail(email);
        return presentationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse).toList();
    }

    private void generateScores(PresentationSession session) {
        Random rng = new Random();
        session.setStructureScore(3 + rng.nextInt(3));
        session.setClarityScore(3 + rng.nextInt(3));
        session.setPersuasivenessScore(2 + rng.nextInt(4));
    }

    private String saveFile(MultipartFile file, String subfolder) throws IOException {
        Path dir = Paths.get(uploadDir, "presentations", subfolder);
        Files.createDirectories(dir);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.write(dir.resolve(filename), file.getBytes());
        return "/uploads/presentations/" + subfolder + "/" + filename;
    }

    private PresentationSession findByIdAndUser(Long id, Long userId) {
        return presentationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Prezentacijska sesija nije pronađena"));
    }

    private PresentationSessionResponse mapToResponse(PresentationSession session) {
        return PresentationSessionResponse.builder()
                .id(session.getId())
                .inputText(session.getInputText())
                .audioUrl(session.getAudioUrl())
                .videoUrl(session.getVideoUrl())
                .structureScore(session.getStructureScore())
                .clarityScore(session.getClarityScore())
                .persuasivenessScore(session.getPersuasivenessScore())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
