package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.Target;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TargetRepository extends JpaRepository<Target, Long> {
    List<Target> findAllByOrderByMetricCodeAscEffectiveFromDesc();
    Optional<Target> findFirstByMetricCodeAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
            String metricCode, LocalDate asOf);
}
