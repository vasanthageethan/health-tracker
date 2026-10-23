package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.DailyLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface DailyLogRepository extends JpaRepository<DailyLog, LocalDate> {
}
