package com.persuasioncoach.repository;

import com.persuasioncoach.entity.Scenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScenarioRepository extends JpaRepository<Scenario, Long> {
    List<Scenario> findByTopicIdAndActiveTrue(Long topicId);
    List<Scenario> findByTopicIdInAndActiveTrue(List<Long> topicIds);
    Optional<Scenario> findFirstByTopic_TitleIgnoreCaseAndInterlocutorTypeAndActiveTrue(
            String topicTitle, Scenario.InterlocutorType interlocutorType);
}
