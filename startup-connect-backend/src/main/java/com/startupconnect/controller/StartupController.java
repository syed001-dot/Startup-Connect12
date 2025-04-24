package com.startupconnect.controller;

import com.startupconnect.model.StartupProfile;
import com.startupconnect.dto.StartupDto;
import com.startupconnect.model.User;
import com.startupconnect.service.StartupService;
import com.startupconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/startups")
@CrossOrigin(origins = "http://localhost:3000")
public class StartupController {

    @Autowired
    private StartupService startupService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<StartupProfile>> getAllStartups() {
        List<StartupProfile> startups = startupService.getAllStartups();
        return ResponseEntity.ok(startups);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStartupById(@PathVariable Long id) {
        StartupProfile startup = startupService.getStartupById(id);
        if (startup == null) {
            return ResponseEntity.notFound().build();
        }
        // Map entity to DTO (manual mapping)
        StartupDto dto = new StartupDto();
        dto.setId(startup.getId());
        dto.setStartupName(startup.getStartupName());
        dto.setIndustry(startup.getIndustry());
        dto.setDescription(startup.getDescription());
        dto.setFundingStage(startup.getFundingStage());
        dto.setWebsite(startup.getWebsite());
        // Handle teamSize as Integer if possible
        try {
            dto.setTeamSize(startup.getTeamSize() != null ? Integer.parseInt(startup.getTeamSize()) : null);
        } catch (NumberFormatException e) {
            dto.setTeamSize(null);
        }
        
        // Set the user ID from the startup's user
        if (startup.getUser() != null) {
            dto.setUserId(startup.getUser().getId());
            System.out.println("Setting userId in DTO: " + startup.getUser().getId());
        } else {
            System.out.println("No user found for startup: " + startup.getId());
        }
        
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getStartupProfile() {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            User currentUser = userService.findByEmail(authentication.getName());
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            // Get startup profile
            StartupProfile profile = userService.getStartupProfileByUserId(currentUser.getId());
            if (profile == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Startup profile not found");
            }

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/profile")
    public ResponseEntity<?> createStartupProfile(@RequestBody StartupProfile profile) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(authentication.getName());

            // Set user and save profile
            profile.setUser(currentUser);
            StartupProfile savedProfile = userService.saveStartupProfile(profile);
            return ResponseEntity.ok(savedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateStartupProfile(@RequestBody StartupProfile profile) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(authentication.getName());

            // Get existing profile
            StartupProfile existingProfile = userService.getStartupProfileByUserId(currentUser.getId());
            
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
            
            // Save updated profile
            StartupProfile updatedProfile = userService.saveStartupProfile(existingProfile);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private StartupDto toDTO(StartupProfile startupProfile) {
        StartupDto dto = new StartupDto();
        dto.setId(startupProfile.getId());
        dto.setStartupName(startupProfile.getStartupName());
        dto.setIndustry(startupProfile.getIndustry());
        dto.setDescription(startupProfile.getDescription());
        dto.setFundingStage(startupProfile.getFundingStage());
        dto.setWebsite(startupProfile.getWebsite());
        
        // Handle teamSize conversion from String to Integer
        try {
            String teamSize = startupProfile.getTeamSize();
            if (teamSize != null) {
                dto.setTeamSize(Integer.parseInt(teamSize));
            } else {
                dto.setTeamSize(null);
            }
        } catch (NumberFormatException e) {
            dto.setTeamSize(null);
        }
        
        // Add user ID if user exists
        if (startupProfile.getUser() != null) {
            dto.setUserId(startupProfile.getUser().getId());
        }
        
        return dto;
    }
} 