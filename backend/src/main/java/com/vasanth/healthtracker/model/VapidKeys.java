package com.vasanth.healthtracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Singleton (id=1), generated once at first startup. Never regenerated: changing it
 *  would silently invalidate every subscription already stored. */
@Entity
@Table(name = "vapid_keys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VapidKeys {

    @Id
    private Long id;

    @Column(length = 500)
    private String publicKey;

    @Column(length = 500)
    private String privateKey;
}
