package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.Target;
import com.vasanth.healthtracker.repository.TargetRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/targets")
public class TargetController {

    // Resting HR deliberately excluded: it's a biomarker outcome, not a behavior you
    // directly control day to day. Still logged and charted, just not graded.
    static final List<String> METRIC_CODES = List.of(
            "SLEEP_MIN_HOURS", "SLEEP_MAX_HOURS", "ON_SCHEDULE_NIGHTS",
            "STRENGTH_SESSIONS", "RUNS", "CARDIO_MINUTES", "PROTEIN_PER_KG", "HAIR_ADHERENCE_PCT");

    private final TargetRepository repository;

    public TargetController(TargetRepository repository) {
        this.repository = repository;
    }

    /** The one active target per metric, as of today. */
    @GetMapping("/current")
    public Map<String, Target> current() {
        LocalDate today = LocalDate.now();
        Map<String, Target> result = new LinkedHashMap<>();
        for (String code : METRIC_CODES) {
            repository.findFirstByMetricCodeAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(code, today)
                    .ifPresent(t -> result.put(code, t));
        }
        return result;
    }

    @GetMapping
    public List<Target> history() {
        return repository.findAllByOrderByMetricCodeAscEffectiveFromDesc();
    }

    /** Never updates a row -- inserts a new one effective from today (or the given date). */
    @PostMapping
    public Target create(@RequestBody Target input) {
        input.setId(null);
        if (input.getEffectiveFrom() == null) {
            input.setEffectiveFrom(LocalDate.now());
        }
        return repository.save(input);
    }
}
