package com.persuasioncoach.repository;

import com.persuasioncoach.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByAnalysisId(Long analysisId);
    List<Feedback> findByAnalysisIdAndType(Long analysisId, Feedback.FeedbackType type);
}
