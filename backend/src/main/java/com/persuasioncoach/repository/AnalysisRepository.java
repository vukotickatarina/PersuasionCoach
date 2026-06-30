package com.persuasioncoach.repository;

import com.persuasioncoach.entity.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalysisRepository extends JpaRepository<Analysis, Long> {
    Optional<Analysis> findBySessionId(Long sessionId);
    boolean existsBySessionId(Long sessionId);
}
