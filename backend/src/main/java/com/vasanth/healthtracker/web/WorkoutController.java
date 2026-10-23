package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.Workout;
import com.vasanth.healthtracker.repository.WorkoutRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutRepository repository;

    public WorkoutController(WorkoutRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Workout> listForDate(@RequestParam LocalDate date) {
        return repository.findByDateOrderByIdDesc(date);
    }

    @PostMapping
    public Workout create(@RequestBody Workout workout) {
        return repository.save(workout);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
