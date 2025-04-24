package com.startupconnect.repository;

import com.startupconnect.model.Startup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StartupRepository extends JpaRepository<Startup, Long> {
    List<Startup> findByFounderId(Long founderId);
    List<Startup> findByIndustry(String industry);
} 