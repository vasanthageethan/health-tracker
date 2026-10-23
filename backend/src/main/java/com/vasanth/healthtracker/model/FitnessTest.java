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

@Entity
@Table(name = "fitness_test")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FitnessTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    /** PUSHUPS, DEAD_HANG, PULLUPS, PLANK, COOPER, SQUAT_HOLD, TOE_TOUCH, IIEF5. */
    private String testCode;

    @Column(name = "result_value")
    private Double value;
    private String unit;
}
