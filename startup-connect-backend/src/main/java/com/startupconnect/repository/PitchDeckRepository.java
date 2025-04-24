package com.startupconnect.repository;

import com.startupconnect.model.PitchDeck;
import com.startupconnect.model.StartupProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PitchDeckRepository extends JpaRepository<PitchDeck, Long> {
    List<PitchDeck> findByStartup(StartupProfile startup);
    List<PitchDeck> findByStartupAndIsPublic(StartupProfile startup, Boolean isPublic);
} 