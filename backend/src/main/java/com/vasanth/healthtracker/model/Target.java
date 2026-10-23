package com.vasanth.healthtracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * A target is never edited or deleted -- changing one inserts a new row effective from
 * today, so past weeks still reflect whatever target was active then.
 */
@Entity
@Table(name = "target")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Target {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String metricCode;

    /** GTE or LTE. */
    private String comparator;

    @Column(name = "target_value")
    private Double value;
    private LocalDate effectiveFrom;
}
