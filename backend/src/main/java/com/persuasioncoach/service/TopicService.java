package com.persuasioncoach.service;

import com.persuasioncoach.dto.request.CreateCustomTopicRequest;
import com.persuasioncoach.dto.request.CreateTopicRequest;
import com.persuasioncoach.dto.response.ScenarioResponse;
import com.persuasioncoach.dto.response.TopicResponse;
import com.persuasioncoach.entity.Scenario;
import com.persuasioncoach.entity.Topic;
import com.persuasioncoach.exception.BadRequestException;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.ScenarioRepository;
import com.persuasioncoach.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final ScenarioRepository scenarioRepository;

    public List<TopicResponse> getAllTopics(String difficulty, String sort) {
        List<Topic> topics;
        if (difficulty != null && !difficulty.isBlank()) {
            try {
                Topic.Difficulty diff = Topic.Difficulty.valueOf(difficulty.toUpperCase());
                topics = topicRepository.findByActiveTrueAndDifficulty(diff);
            } catch (IllegalArgumentException e) {
                topics = topicRepository.findByActiveTrue();
            }
        } else if ("popular".equalsIgnoreCase(sort)) {
            topics = topicRepository.findByActiveTrueAndPopularTrue();
        } else {
            topics = topicRepository.findByActiveTrue();
        }
        return topics.stream().map(this::mapToResponse).toList();
    }

    public List<TopicResponse> getCategories() {
        return topicRepository.findByParentIdIsNullAndActiveTrue()
                .stream().map(this::mapToResponse).toList();
    }

    public List<TopicResponse> getSubcategories(Long categoryId) {
        return topicRepository.findByParentIdAndActiveTrue(categoryId)
                .stream().map(this::mapToResponse).toList();
    }

    public TopicResponse getTopicById(Long id) {
        return mapToResponse(findById(id));
    }

    @Transactional
    public TopicResponse createTopic(CreateTopicRequest request) {
        Topic topic = Topic.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .illustration(request.getIllustration())
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : Topic.Difficulty.EASY)
                .popular(request.getPopular() != null && request.getPopular())
                .parentId(request.getParentId())
                .build();
        return mapToResponse(topicRepository.save(topic));
    }

    @Transactional
    public ScenarioResponse createCustomTopic(CreateCustomTopicRequest request) {
        log.info("createCustomTopic START: title='{}', category='{}', interlocutorType='{}', hasContext={}",
                request.getTitle(), request.getCategoryTitle(), request.getInterlocutorType(),
                request.getCustomContext() != null && !request.getCustomContext().isBlank());

        List<Topic> categories = topicRepository.findByParentIdIsNullAndActiveTrue();
        log.info("Pronađene kategorije u DB: {}", categories.stream().map(Topic::getTitle).toList());

        Topic category = categories.stream()
                .filter(t -> t.getTitle().equalsIgnoreCase(request.getCategoryTitle()))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("Kategorija nije pronađena: '{}'. Dostupne: {}", request.getCategoryTitle(),
                            categories.stream().map(Topic::getTitle).toList());
                    return new BadRequestException("Kategorija nije pronađena: " + request.getCategoryTitle());
                });
        log.info("Kategorija pronađena: id={}, title='{}'", category.getId(), category.getTitle());

        Topic topic = Topic.builder()
                .title(request.getTitle())
                .description(request.getDescription() != null ? request.getDescription() : "")
                .difficulty(Topic.Difficulty.MEDIUM)
                .parentId(category.getId())
                .active(true)
                .popular(false)
                .build();
        topic = topicRepository.save(topic);

        Scenario.InterlocutorType interlocutorType;
        try {
            interlocutorType = Scenario.InterlocutorType.valueOf(request.getInterlocutorType());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Nepoznat tip sagovornika: " + request.getInterlocutorType());
        }

        String profile = switch (interlocutorType) {
            case SKEPTICAL_FRIEND -> "Tvoj skeptični prijatelj koji dovodi u pitanje tvoje argumente";
            case AUTHORITY -> "Autoritet koji traži precizne dokaze i logičku strukturu";
            case PARENT -> "Roditelj koji brine i gleda iz emotivne perspektive";
            case STRANGER -> "Neutralna osoba kojoj treba sve objasniti od početka";
            case DEBATER -> "Iskusan debater koji odmah napada slabe tačke";
            default -> "Sagovornik";
        };

        Scenario scenario = Scenario.builder()
                .topic(topic)
                .title(request.getTitle())
                .description(request.getDescription() != null ? request.getDescription() : "Vlastita tema korisnika")
                .interlocutorType(interlocutorType)
                .interlocutorProfile(profile)
                .customContext(request.getCustomContext())
                .active(true)
                .build();
        scenario = scenarioRepository.save(scenario);
        log.info("createCustomTopic SUCCESS: topicId={}, scenarioId={}", topic.getId(), scenario.getId());

        return ScenarioResponse.builder()
                .id(scenario.getId())
                .topicId(topic.getId())
                .topicTitle(topic.getTitle())
                .title(scenario.getTitle())
                .description(scenario.getDescription())
                .interlocutorType(scenario.getInterlocutorType())
                .interlocutorProfile(scenario.getInterlocutorProfile())
                .active(scenario.isActive())
                .build();
    }

    @Transactional
    public TopicResponse updateTopic(Long id, CreateTopicRequest request) {
        Topic topic = findById(id);
        if (request.getTitle() != null) topic.setTitle(request.getTitle());
        if (request.getDescription() != null) topic.setDescription(request.getDescription());
        if (request.getIllustration() != null) topic.setIllustration(request.getIllustration());
        if (request.getDifficulty() != null) topic.setDifficulty(request.getDifficulty());
        if (request.getPopular() != null) topic.setPopular(request.getPopular());
        if (request.getParentId() != null) topic.setParentId(request.getParentId());
        return mapToResponse(topicRepository.save(topic));
    }

    @Transactional
    public void deleteTopic(Long id) {
        Topic topic = findById(id);
        topic.setActive(false);
        topicRepository.save(topic);
    }

    public Topic findById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tema nije pronađena sa ID: " + id));
    }

    public TopicResponse mapToResponse(Topic topic) {
        return TopicResponse.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .illustration(topic.getIllustration())
                .difficulty(topic.getDifficulty())
                .popular(topic.isPopular())
                .active(topic.isActive())
                .createdAt(topic.getCreatedAt())
                .parentId(topic.getParentId())
                .build();
    }
}
