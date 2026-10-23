package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.FitnessTest;
import com.vasanth.healthtracker.repository.FitnessTestRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fitness-tests")
public class FitnessTestController {

    private final FitnessTestRepository repository;

    public FitnessTestController(FitnessTestRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<FitnessTest> list() {
        return repository.findAllByOrderByDateDesc();
    }

    /** One check-in produces several results (push-ups, plank, Cooper, ...) at once. */
    @PostMapping
    public List<FitnessTest> createBatch(@RequestBody List<FitnessTest> results) {
        results.forEach(r -> r.setId(null));
        return repository.saveAll(results);
    }
}
