package com.startupconnect.controller;

import com.startupconnect.model.InvestorProfile;
import com.startupconnect.model.User;
import com.startupconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/investor")
@CrossOrigin(origins = "http://localhost:3000")
public class InvestorProfileController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getInvestorProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(authentication.getName());
            InvestorProfile profile = userService.getInvestorProfileByUserId(currentUser.getId());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateInvestorProfile(@RequestBody InvestorProfile profile) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(authentication.getName());
            
            // Validate investment range if provided
            if (profile.getInvestmentRangeMin() != null && profile.getInvestmentRangeMax() != null) {
                if (profile.getInvestmentRangeMin() > profile.getInvestmentRangeMax()) {
                    return ResponseEntity.badRequest().body("Minimum investment range cannot be greater than maximum");
                }
                if (profile.getInvestmentRangeMin() < 0 || profile.getInvestmentRangeMax() < 0) {
                    return ResponseEntity.badRequest().body("Investment range values cannot be negative");
                }
            }

            InvestorProfile existingProfile = userService.getInvestorProfileByUserId(currentUser.getId());
            
            // Update only the provided fields
            if (profile.getCompanyName() != null) {
                existingProfile.setCompanyName(profile.getCompanyName());
            }
            if (profile.getSector() != null) {
                existingProfile.setSector(profile.getSector());
            }
            if (profile.getInvestmentRangeMin() != null) {
                existingProfile.setInvestmentRangeMin(profile.getInvestmentRangeMin());
            }
            if (profile.getInvestmentRangeMax() != null) {
                existingProfile.setInvestmentRangeMax(profile.getInvestmentRangeMax());
            }
            if (profile.getLocation() != null) {
                existingProfile.setLocation(profile.getLocation());
            }
            if (profile.getInvestmentFocus() != null) {
                existingProfile.setInvestmentFocus(profile.getInvestmentFocus());
            }
            if (profile.getDescription() != null) {
                existingProfile.setDescription(profile.getDescription());
            }
            
            InvestorProfile updatedProfile = userService.saveInvestorProfile(existingProfile);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 