package com.vasanth.healthtracker.model;

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
@Table(name = "body_measurement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BodyMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private Double waistCm;
    private Double heightCm;
    private Integer bpSystolic;
    private Integer bpDiastolic;

    @Transient
    public Double getRatio() {
        return (waistCm != null && heightCm != null && heightCm > 0) ? waistCm / heightCm : null;
    }
}
