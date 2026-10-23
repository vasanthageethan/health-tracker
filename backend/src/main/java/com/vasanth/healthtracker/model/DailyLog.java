package com.vasanth.healthtracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "daily_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailyLog {

    @Id
    @Column(name = "log_date")
    private LocalDate date;

    private Double sleepHours;
    private Boolean onSchedule;
    private Integer restingHr;
    private Double weightKg;
    private Integer proteinG;
    private Integer alcoholDrinks;
    private Boolean morningErection;

    @Column(length = 2000)
    private String notes;

    private Instant updatedAt;
}
