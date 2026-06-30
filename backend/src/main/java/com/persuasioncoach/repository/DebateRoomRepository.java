package com.persuasioncoach.repository;

import com.persuasioncoach.entity.DebateRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DebateRoomRepository extends JpaRepository<DebateRoom, Long> {
    Optional<DebateRoom> findByCode(String code);
}
