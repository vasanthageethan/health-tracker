package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.Treatment;
import com.vasanth.healthtracker.repository.TreatmentRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
