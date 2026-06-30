package com.persuasioncoach.repository;

import com.persuasioncoach.entity.DebateMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebateMessageRepository extends JpaRepository<DebateMessage, Long> {
    List<DebateMessage> findByRoomCodeOrderByTimestampAsc(String roomCode);
    long countByRoomCodeAndAiCommentFalse(String roomCode);
}
