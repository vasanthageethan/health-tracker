package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.TreatmentLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TreatmentLogRepository extends JpaRepository<TreatmentLog, Long> {
    List<TreatmentLog> findByDate(LocalDate date);
    List<TreatmentLog> findByDateBetween(LocalDate from, LocalDate to);
    Optional<TreatmentLog> findByDateAndTreatmentId(LocalDate date, Long treatmentId);
}
