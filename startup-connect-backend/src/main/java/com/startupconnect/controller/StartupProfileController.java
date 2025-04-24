package com.startupconnect.controller;

import com.startupconnect.model.StartupProfile;
import com.startupconnect.model.User;
import com.startupconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/startup-profile")
@CrossOrigin(origins = "http://localhost:3000")
public class StartupProfileController {

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getStartupProfile(@PathVariable Long userId) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(authentication.getName());

            // Check if user is requesting their own profile
            if (currentUser.getId().equals(userId)) {
                StartupProfile profile = userService.getStartupProfileByUserId(userId);
                return ResponseEntity.ok(profile);
            } else {
                return ResponseEntity.badRequest().body("You can only access your own profile");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateStartupProfile(@PathVariable Long userId, @RequestBody StartupProfile profile) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(authentication.getName());

            // Check if user is updating their own profile
            if (currentUser.getId().equals(userId)) {
                StartupProfile existingProfile = userService.getStartupProfileByUserId(userId);
                existingProfile.setStartupName(profile.getStartupName());
                existingProfile.setDescription(profile.getDescription());
                existingProfile.setIndustry(profile.getIndustry());
                existingProfile.setFundingStage(profile.getFundingStage());
                
                StartupProfile updatedProfile = userService.saveStartupProfile(existingProfile);
                return ResponseEntity.ok(updatedProfile);
            } else {
                return ResponseEntity.badRequest().body("You can only update your own profile");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 