package com.persuasioncoach.repository;

import com.persuasioncoach.entity.ConversationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationSessionRepository extends JpaRepository<ConversationSession, Long> {
    List<ConversationSession> findByUserIdOrderByStartedAtDesc(Long userId);

    @Query("SELECT COUNT(s) FROM ConversationSession s WHERE s.user.id = :userId AND s.status = 'COMPLETED'")
    long countCompletedByUserId(Long userId);

    @Query("SELECT AVG((a.argumentClarity + a.persuasiveness + a.interlocutorAdaptation) / 3.0) FROM Analysis a WHERE a.session.user.id = :userId")
    Double avgScoreByUserId(Long userId);
}
