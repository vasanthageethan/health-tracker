package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findByDateOrderByIdDesc(LocalDate date);
}
