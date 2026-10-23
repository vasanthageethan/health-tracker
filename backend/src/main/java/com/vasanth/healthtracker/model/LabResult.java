package com.vasanth.healthtracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "lab_result")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String testName;

    @Column(name = "result_value")
    private Double value;
    private String unit;
    private Double refLow;
    private Double refHigh;

    @Transient
    public Boolean getInRange() {
        if (refLow == null || refHigh == null || value == null) return null;
        return value >= refLow && value <= refHigh;
    }

    @Transient
    public LocalDate getRetestDue() {
        Boolean inRange = getInRange();
        return (inRange != null && !inRange) ? date.plusMonths(3) : null;
    }
}
