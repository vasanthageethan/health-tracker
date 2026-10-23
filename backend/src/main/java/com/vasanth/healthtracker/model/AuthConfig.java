package com.vasanth.healthtracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Singleton row (id always 1): this is a single-user app, one PIN for the whole house. */
@Entity
@Table(name = "auth_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthConfig {

    @Id
    private Long id;

    private String pinHash;
}
