package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.DailyLog;
import com.vasanth.healthtracker.repository.DailyLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/daily-logs")
public class DailyLogController {

    private final DailyLogRepository repository;

    public DailyLogController(DailyLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{date}")
    public ResponseEntity<DailyLog> get(@PathVariable LocalDate date) {
        return repository.findById(date)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{date}")
    public DailyLog save(@PathVariable LocalDate date, @RequestBody DailyLog log) {
        log.setDate(date);
        log.setUpdatedAt(Instant.now());
        return repository.save(log);
    }
}
