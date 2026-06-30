package com.persuasioncoach.repository;

import com.persuasioncoach.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    /**
     * Find users who have at least one session but none started in the last `since` period.
     * Only includes users who have notifications and reminders enabled.
     */
    @Query("SELECT u FROM User u WHERE u.notificationsEnabled = true AND u.notifyReminders = true " +
           "AND u.id IN (SELECT DISTINCT s.user.id FROM ConversationSession s) " +
           "AND u.id NOT IN (SELECT DISTINCT s2.user.id FROM ConversationSession s2 WHERE s2.startedAt >= :since)")
    List<User> findUsersWithNoRecentSession(@Param("since") LocalDateTime since);
}
