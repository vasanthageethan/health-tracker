package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TreatmentRepository extends JpaRepository<Treatment, Long> {
}
