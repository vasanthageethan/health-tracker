package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    Optional<PushSubscription> findByEndpoint(String endpoint);
    void deleteByEndpoint(String endpoint);
}
