package com.vasanth.healthtracker;

import com.vasanth.healthtracker.model.Treatment;
import com.vasanth.healthtracker.repository.TreatmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;

@SpringBootApplication
public class HealthTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthTrackerApplication.class, args);
    }

    // Seeds the fixed hair-routine items once; idempotent so it's safe on every restart.
    @Bean
    CommandLineRunner seedTreatments(TreatmentRepository treatments) {
        return args -> {
            if (treatments.count() > 0) {
                return;
            }
            LocalDate start = LocalDate.of(2026, 10, 6);
            treatments.save(new Treatment(null, "Dutasteride (Happy Head), morning", "DAILY", start, null));
            treatments.save(new Treatment(null, "Dutasteride (Happy Head), evening", "DAILY", start, null));
            treatments.save(new Treatment(null, "Low-light therapy cap", "DAILY", start, null));
            treatments.save(new Treatment(null, "Dermastamp", "THU", start, null));
            treatments.save(new Treatment(null, "Ketoconazole shampoo", "WED,SAT", start, null));
        };
    }
}
