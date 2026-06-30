package com.persuasioncoach.service;

import com.persuasioncoach.dto.request.CreateScenarioRequest;
import com.persuasioncoach.dto.response.ScenarioResponse;
import com.persuasioncoach.entity.Scenario;
import com.persuasioncoach.entity.Topic;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.ScenarioRepository;
import com.persuasioncoach.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScenarioService {

    private final ScenarioRepository scenarioRepository;
    private final TopicRepository topicRepository;

    @Transactional(readOnly = true)
    public List<ScenarioResponse> getScenariosByTopic(Long topicId) {
        topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Tema nije pronađena"));

        List<Topic> subcategories = topicRepository.findByParentIdAndActiveTrue(topicId);
        if (!subcategories.isEmpty()) {
            List<Long> subIds = subcategories.stream().map(Topic::getId).toList();
            return scenarioRepository.findByTopicIdInAndActiveTrue(subIds).stream()
                    .map(this::mapToResponse).toList();
        }

        return scenarioRepository.findByTopicIdAndActiveTrue(topicId).stream()
                .map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public ScenarioResponse getScenarioById(Long id) {
        return mapToResponse(findById(id));
    }

    @Transactional
    public ScenarioResponse createScenario(CreateScenarioRequest request) {
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Tema nije pronađena"));
        Scenario scenario = Scenario.builder()
                .topic(topic)
                .title(request.getTitle())
                .description(request.getDescription())
                .interlocutorType(request.getInterlocutorType())
                .interlocutorProfile(request.getInterlocutorProfile())
                .build();
        return mapToResponse(scenarioRepository.save(scenario));
    }

    @Transactional
    public ScenarioResponse updateScenario(Long id, CreateScenarioRequest request) {
        Scenario scenario = findById(id);
        if (request.getTitle() != null) scenario.setTitle(request.getTitle());
        if (request.getDescription() != null) scenario.setDescription(request.getDescription());
        if (request.getInterlocutorType() != null) scenario.setInterlocutorType(request.getInterlocutorType());
        if (request.getInterlocutorProfile() != null) scenario.setInterlocutorProfile(request.getInterlocutorProfile());
        return mapToResponse(scenarioRepository.save(scenario));
    }

    @Transactional
    public void deleteScenario(Long id) {
        Scenario scenario = findById(id);
        scenario.setActive(false);
        scenarioRepository.save(scenario);
    }

    @Transactional(readOnly = true)
    public Scenario findById(Long id) {
        return scenarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scenarij nije pronađen sa ID: " + id));
    }

    @Transactional(readOnly = true)
    public ScenarioResponse mapToResponse(Scenario scenario) {
        return ScenarioResponse.builder()
                .id(scenario.getId())
                .topicId(scenario.getTopic().getId())
                .topicTitle(scenario.getTopic().getTitle())
                .title(scenario.getTitle())
                .description(scenario.getDescription())
                .interlocutorType(scenario.getInterlocutorType())
                .interlocutorProfile(scenario.getInterlocutorProfile())
                .active(scenario.isActive())
                .build();
    }
}
