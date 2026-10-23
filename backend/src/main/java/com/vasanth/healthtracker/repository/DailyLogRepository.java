package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.DailyLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DailyLogRepository extends JpaRepository<DailyLog, LocalDate> {
    List<DailyLog> findByDateBetweenOrderByDateAsc(LocalDate from, LocalDate to);
}
