package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.RunPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RunPlanRepository extends JpaRepository<RunPlan, LocalDate> {
    Optional<RunPlan> findTopByOrderByWeekStartDesc();
    List<RunPlan> findAllByOrderByWeekStartAsc();
}
