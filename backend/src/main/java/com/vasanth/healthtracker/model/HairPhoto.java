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
@Table(name = "hair_photo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HairPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    /** HAIRLINE, TEMPLES, or CROWN. */
    private String view;

    private String filePath;

    @Column(length = 1000)
    private String sheddingNote;

    @Column(length = 1000)
    private String sideEffectNote;
}
