package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.FitnessTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FitnessTestRepository extends JpaRepository<FitnessTest, Long> {
    List<FitnessTest> findAllByOrderByDateDesc();
    Optional<FitnessTest> findTopByOrderByDateDesc();
}
