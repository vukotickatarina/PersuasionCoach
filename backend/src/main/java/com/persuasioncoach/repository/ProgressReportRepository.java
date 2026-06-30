package com.persuasioncoach.repository;

import com.persuasioncoach.entity.ProgressReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressReportRepository extends JpaRepository<ProgressReport, Long> {
    List<ProgressReport> findByUserIdOrderByGeneratedAtDesc(Long userId);
}
