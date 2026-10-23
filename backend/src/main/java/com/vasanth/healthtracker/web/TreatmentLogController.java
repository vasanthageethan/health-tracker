package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.TreatmentLog;
import com.vasanth.healthtracker.repository.TreatmentLogRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/treatment-logs")
public class TreatmentLogController {

    private final TreatmentLogRepository repository;

    public TreatmentLogController(TreatmentLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TreatmentLog> listForDate(@RequestParam LocalDate date) {
        return repository.findByDate(date);
    }

    @PutMapping("/{date}/{treatmentId}")
    public TreatmentLog save(@PathVariable LocalDate date, @PathVariable Long treatmentId,
                              @RequestBody TreatmentLog incoming) {
        TreatmentLog log = repository.findByDateAndTreatmentId(date, treatmentId)
                .orElseGet(TreatmentLog::new);
        log.setDate(date);
        log.setTreatmentId(treatmentId);
        log.setDone(incoming.getDone());
        log.setTime(incoming.getTime());
        log.setNotes(incoming.getNotes());
        return repository.save(log);
    }
}
