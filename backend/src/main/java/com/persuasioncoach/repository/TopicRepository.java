package com.persuasioncoach.repository;

import com.persuasioncoach.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByActiveTrue();
    List<Topic> findByActiveTrueAndDifficulty(Topic.Difficulty difficulty);
    List<Topic> findByActiveTrueAndPopularTrue();
    List<Topic> findByParentIdIsNullAndActiveTrue();
    List<Topic> findByParentIdAndActiveTrue(Long parentId);
    long countByParentIdIsNull();
    Optional<Topic> findByTitleIgnoreCase(String title);
}
