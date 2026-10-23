package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.model.RunPlan;
import com.vasanth.healthtracker.repository.RunPlanRepository;
import com.vasanth.healthtracker.repository.WorkoutRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/run-plan")
public class RunPlanController {

    private final RunPlanRepository repository;
    private final WorkoutRepository workoutRepository;

    public RunPlanController(RunPlanRepository repository, WorkoutRepository workoutRepository) {
        this.repository = repository;
        this.workoutRepository = workoutRepository;
    }

    private record RunPlanStatus(LocalDate weekStart, Double plannedKm, Double baseKm, Double startPct,
                                  Double weeklyIncrease, double actualKm, boolean overPlan) {}

    @GetMapping("/current")
    public ResponseEntity<RunPlanStatus> current() {
        LocalDate weekStart = mondayOf(LocalDate.now());
        RunPlan plan = repository.findById(weekStart).orElse(null);

        if (plan == null) {
            Optional<RunPlan> previous = repository.findTopByOrderByWeekStartDesc();
            if (previous.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            RunPlan prev = previous.get();
            plan = repository.save(new RunPlan(weekStart, prev.getPlannedKm() * (1 + prev.getWeeklyIncrease()),
                    prev.getBaseKm(), prev.getStartPct(), prev.getWeeklyIncrease()));
        }

        double actualKm = workoutRepository.findByDateBetween(weekStart, weekStart.plusDays(6)).stream()
                .filter(w -> "RUN".equals(w.getType()) && w.getDistanceKm() != null)
                .mapToDouble(w -> w.getDistanceKm())
                .sum();
        boolean overPlan = actualKm > plan.getPlannedKm() * 1.1;

        return ResponseEntity.ok(new RunPlanStatus(plan.getWeekStart(), plan.getPlannedKm(), plan.getBaseKm(),
                plan.getStartPct(), plan.getWeeklyIncrease(), actualKm, overPlan));
    }

    /** Restarts (or adjusts) the plan from this week forward; past weeks are never rewritten. */
    @PostMapping("/init")
    public RunPlan init(@RequestBody RunPlan input) {
        LocalDate weekStart = mondayOf(LocalDate.now());
        double plannedKm = input.getBaseKm() * input.getStartPct();
        return repository.save(new RunPlan(weekStart, plannedKm, input.getBaseKm(),
                input.getStartPct(), input.getWeeklyIncrease()));
    }

    @GetMapping("/history")
    public List<RunPlan> history() {
        return repository.findAllByOrderByWeekStartAsc();
    }

    private static LocalDate mondayOf(LocalDate date) {
        return date.minusDays(date.getDayOfWeek().getValue() - 1);
    }
}
