package com.persuasioncoach.repository;

import com.persuasioncoach.entity.PresentationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PresentationSessionRepository extends JpaRepository<PresentationSession, Long> {
    List<PresentationSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<PresentationSession> findByIdAndUserId(Long id, Long userId);
}
