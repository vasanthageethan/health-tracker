package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.BodyMeasurement;
import com.vasanth.healthtracker.repository.BodyMeasurementRepository;
import com.vasanth.healthtracker.repository.FitnessTestRepository;
import com.vasanth.healthtracker.repository.HairPhotoRepository;
import com.vasanth.healthtracker.repository.LabResultRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/due-status")
public class DueStatusController {

    private final BodyMeasurementRepository bodyMeasurements;
    private final FitnessTestRepository fitnessTests;
    private final LabResultRepository labResults;
    private final HairPhotoRepository hairPhotos;

    public DueStatusController(BodyMeasurementRepository bodyMeasurements, FitnessTestRepository fitnessTests,
                                LabResultRepository labResults, HairPhotoRepository hairPhotos) {
        this.bodyMeasurements = bodyMeasurements;
        this.fitnessTests = fitnessTests;
        this.labResults = labResults;
        this.hairPhotos = hairPhotos;
    }

    private record DueItem(String label, LocalDate lastDate, Long daysSince, int intervalDays, boolean overdue) {}

    @GetMapping
    public Map<String, DueItem> get() {
        LocalDate today = LocalDate.now();
        Map<String, DueItem> status = new LinkedHashMap<>();

        status.put("waist", dueItem("Waist", bodyMeasurements.findTopByWaistCmIsNotNullOrderByDateDesc()
                .map(BodyMeasurement::getDate).orElse(null), 14, today));
        status.put("bloodPressure", dueItem("Blood pressure", bodyMeasurements.findTopByBpSystolicIsNotNullOrderByDateDesc()
                .map(BodyMeasurement::getDate).orElse(null), 30, today));
        status.put("hairPhoto", dueItem("Hair photos", hairPhotos.findTopByOrderByDateDesc()
                .map(p -> p.getDate()).orElse(null), 28, today));
        status.put("fitnessTest", dueItem("Fitness test battery", fitnessTests.findTopByOrderByDateDesc()
                .map(t -> t.getDate()).orElse(null), 56, today));
        status.put("labs", dueItem("Labs", labResults.findTopByOrderByDateDesc()
                .map(l -> l.getDate()).orElse(null), 365, today));

        return status;
    }

    private DueItem dueItem(String label, LocalDate lastDate, int intervalDays, LocalDate today) {
        if (lastDate == null) {
            return new DueItem(label, null, null, intervalDays, true);
        }
        long daysSince = ChronoUnit.DAYS.between(lastDate, today);
        return new DueItem(label, lastDate, daysSince, intervalDays, daysSince >= intervalDays);
    }
}
