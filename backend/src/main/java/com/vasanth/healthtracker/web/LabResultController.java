package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.LabResult;
import com.vasanth.healthtracker.repository.LabResultRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lab-results")
public class LabResultController {

    private final LabResultRepository repository;

    public LabResultController(LabResultRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<LabResult> list() {
        return repository.findAllByOrderByDateDesc();
    }

    /** One blood draw produces many results (CBC, lipids, HbA1c, ...) at once. */
    @PostMapping
    public List<LabResult> createBatch(@RequestBody List<LabResult> results) {
        results.forEach(r -> r.setId(null));
        return repository.saveAll(results);
    }
}
