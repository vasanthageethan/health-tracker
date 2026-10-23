package com.vasanth.healthtracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "treatment_log", uniqueConstraints = @UniqueConstraint(columnNames = {"entry_date", "treatment_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entry_date")
    private LocalDate date;

    private Long treatmentId;
    private Boolean done;
    private LocalTime time;

    @Column(length = 500)
    private String notes;
}
