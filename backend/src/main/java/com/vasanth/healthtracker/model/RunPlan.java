package com.vasanth.healthtracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "run_plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RunPlan {

    @Id
    private LocalDate weekStart;

    private Double plannedKm;
    private Double baseKm;
    private Double startPct;
    private Double weeklyIncrease;
}
