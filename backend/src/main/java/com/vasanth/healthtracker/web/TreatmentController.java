package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.Treatment;
import com.vasanth.healthtracker.repository.TreatmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/treatments")
public class TreatmentController {

    private final TreatmentRepository repository;

    public TreatmentController(TreatmentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Treatment> list() {
        return repository.findAll();
    }

    @PostMapping
    public Treatment create(@RequestBody Treatment treatment) {
        treatment.setId(null);
        return repository.save(treatment);
    }

    /** Updates name/schedule, or sets an end date to retire an item without deleting its history. */
    @PutMapping("/{id}")
    public ResponseEntity<Treatment> update(@PathVariable Long id, @RequestBody Treatment input) {
        return repository.findById(id).map(existing -> {
            existing.setName(input.getName());
            existing.setSchedule(input.getSchedule());
            existing.setStartDate(input.getStartDate());
            existing.setEndDate(input.getEndDate());
            return ResponseEntity.ok(repository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
