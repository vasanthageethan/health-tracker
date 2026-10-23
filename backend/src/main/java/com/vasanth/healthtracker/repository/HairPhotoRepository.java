package com.vasanth.healthtracker.repository;

import com.vasanth.healthtracker.model.HairPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HairPhotoRepository extends JpaRepository<HairPhoto, Long> {
    List<HairPhoto> findAllByOrderByDateDesc();
    Optional<HairPhoto> findTopByOrderByDateDesc();
    List<HairPhoto> findByViewOrderByDateAsc(String view);
}
