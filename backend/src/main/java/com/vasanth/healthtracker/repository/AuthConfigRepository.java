package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.AuthConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthConfigRepository extends JpaRepository<AuthConfig, Long> {
}
