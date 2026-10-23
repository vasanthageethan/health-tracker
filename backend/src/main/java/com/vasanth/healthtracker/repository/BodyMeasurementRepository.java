package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.BodyMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BodyMeasurementRepository extends JpaRepository<BodyMeasurement, Long> {
    List<BodyMeasurement> findAllByOrderByDateDesc();
    Optional<BodyMeasurement> findTopByWaistCmIsNotNullOrderByDateDesc();
    Optional<BodyMeasurement> findTopByBpSystolicIsNotNullOrderByDateDesc();
}
