package com.vasanth.healthtracker;

import com.vasanth.healthtracker.model.Target;
import com.vasanth.healthtracker.model.Treatment;
import com.vasanth.healthtracker.model.VapidKeys;
import com.vasanth.healthtracker.push.VapidKeyGenerator;
import com.vasanth.healthtracker.repository.TargetRepository;
import com.vasanth.healthtracker.repository.TreatmentRepository;
import com.vasanth.healthtracker.repository.VapidKeysRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.LocalDate;

@SpringBootApplication
@EnableScheduling
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

    // Seeds the default scorecard targets from the use-case doc once; idempotent.
    @Bean
    CommandLineRunner seedTargets(TargetRepository targets) {
        return args -> {
            if (targets.count() > 0) {
                return;
            }
            LocalDate from = LocalDate.of(2026, 10, 6);
            targets.save(new Target(null, "SLEEP_MIN_HOURS", "GTE", 7.0, from));
            targets.save(new Target(null, "SLEEP_MAX_HOURS", "LTE", 9.0, from));
            targets.save(new Target(null, "ON_SCHEDULE_NIGHTS", "GTE", 5.0, from));
            targets.save(new Target(null, "STRENGTH_SESSIONS", "GTE", 3.0, from));
            targets.save(new Target(null, "RUNS", "GTE", 2.0, from));
            targets.save(new Target(null, "CARDIO_MINUTES", "GTE", 150.0, from));
            targets.save(new Target(null, "PROTEIN_PER_KG", "GTE", 1.6, from));
            targets.save(new Target(null, "HAIR_ADHERENCE_PCT", "GTE", 90.0, from));
        };
    }

    // Generates the VAPID key pair once; never regenerated (would invalidate every
    // stored push subscription).
    @Bean
    CommandLineRunner seedVapidKeys(VapidKeysRepository vapidKeys) {
        return args -> {
            if (vapidKeys.count() > 0) {
                return;
            }
            VapidKeyGenerator.KeyPairStrings keyPair = VapidKeyGenerator.generate();
            vapidKeys.save(new VapidKeys(1L, keyPair.publicKey(), keyPair.privateKey()));
        };
    }
}
