package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    List<LabResult> findAllByOrderByDateDesc();
    Optional<LabResult> findTopByOrderByDateDesc();
}
