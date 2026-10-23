package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.BodyMeasurement;
import com.vasanth.healthtracker.repository.BodyMeasurementRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/body-measurements")
public class BodyMeasurementController {

    private final BodyMeasurementRepository repository;

    public BodyMeasurementController(BodyMeasurementRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<BodyMeasurement> list() {
        return repository.findAllByOrderByDateDesc();
    }

    @PostMapping
    public BodyMeasurement create(@RequestBody BodyMeasurement measurement) {
        measurement.setId(null);
        return repository.save(measurement);
    }
}
