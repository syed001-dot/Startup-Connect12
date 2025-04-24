package com.startupconnect.service;

import com.startupconnect.model.StartupProfile;
import com.startupconnect.repository.StartupProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StartupService {

    @Autowired
    private StartupProfileRepository startupProfileRepository;

    public List<StartupProfile> getAllStartups() {
        return startupProfileRepository.findAll();
    }

    public StartupProfile getStartupById(Long id) {
        return startupProfileRepository.findById(id).orElse(null);
    }

    @Transactional
    public StartupProfile updateStartupProfile(StartupProfile profile) {
        // Get existing profile
        StartupProfile existingProfile = startupProfileRepository.findById(profile.getId())
                .orElseThrow(() -> new RuntimeException("Startup profile not found with id: " + profile.getId()));
        
        // Update fields
        if (profile.getStartupName() != null) {
            existingProfile.setStartupName(profile.getStartupName());
        }
        if (profile.getDescription() != null) {
            existingProfile.setDescription(profile.getDescription());
        }
        if (profile.getIndustry() != null) {
            existingProfile.setIndustry(profile.getIndustry());
        }
        if (profile.getFundingStage() != null) {
            existingProfile.setFundingStage(profile.getFundingStage());
        }
        if (profile.getTeamSize() != null) {
            existingProfile.setTeamSize(profile.getTeamSize());
        }
        if (profile.getWebsite() != null) {
            existingProfile.setWebsite(profile.getWebsite());
        }
        
        return startupProfileRepository.save(existingProfile);
    }
} 