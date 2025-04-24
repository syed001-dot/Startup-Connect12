package com.startupconnect.controller;

import com.startupconnect.model.InvestmentOffer;
import com.startupconnect.model.StartupProfile;
import com.startupconnect.model.User;
import com.startupconnect.model.UserRole;
import com.startupconnect.repository.StartupProfileRepository;
import com.startupconnect.service.InvestmentOfferService;
import com.startupconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/startups/{startupId}/offers")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class InvestmentOfferController {

    @Autowired
    private InvestmentOfferService investmentOfferService;

    @Autowired
    private UserService userService;

    @Autowired
    private StartupProfileRepository startupProfileRepository;

    @PostMapping
    public ResponseEntity<?> createOffer(@PathVariable Long startupId, @RequestBody InvestmentOffer offer) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String username = authentication.getName();
            User user = userService.findByEmail(username);
            if (user == null) {
                return ResponseEntity.status(403).body("User not found");
            }

            StartupProfile startup = startupProfileRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found"));

            // Allow any authenticated user to create an offer
            InvestmentOffer createdOffer = investmentOfferService.createOffer(startupId, offer);
            return ResponseEntity.ok(createdOffer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{offerId}")
    public ResponseEntity<?> updateOffer(
            @PathVariable Long startupId,
            @PathVariable Long offerId,
            @RequestBody InvestmentOffer offer) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String username = authentication.getName();
            User user = userService.findByEmail(username);
            if (user == null) {
                return ResponseEntity.status(403).body("User not found");
            }

            StartupProfile startup = startupProfileRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found"));

            // Allow any authenticated user to update an offer
            InvestmentOffer updatedOffer = investmentOfferService.updateOffer(startupId, offerId, offer);
            return ResponseEntity.ok(updatedOffer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{offerId}")
    public ResponseEntity<?> deleteOffer(@PathVariable Long startupId, @PathVariable Long offerId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String username = authentication.getName();
            User user = userService.findByEmail(username);
            if (user == null) {
                return ResponseEntity.status(403).body("User not found");
            }

            StartupProfile startup = startupProfileRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found"));

            // Allow any authenticated user to delete an offer
            investmentOfferService.deleteOffer(startupId, offerId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Public endpoint to fetch investment offers for a startup
    @GetMapping
    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
    public ResponseEntity<?> getOffers(@PathVariable Long startupId) {
        try {
            List<com.startupconnect.dto.InvestmentOfferDTO> offers = investmentOfferService.getOffersByStartup(startupId);
            return ResponseEntity.ok(offers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveOffers(@PathVariable Long startupId) {
        try {
            List<InvestmentOffer> offers = investmentOfferService.getActiveOffersByStartup(startupId);
            return ResponseEntity.ok(offers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{offerId}/status")
    public ResponseEntity<?> updateOfferStatus(
            @PathVariable Long startupId,
            @PathVariable Long offerId,
            @RequestParam InvestmentOffer.OfferStatus status) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String username = authentication.getName();
            User user = userService.findByEmail(username);
            if (user == null) {
                return ResponseEntity.status(403).body("User not found");
            }

            StartupProfile startup = startupProfileRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found"));

            // Allow any authenticated user to update offer status
            investmentOfferService.updateOfferStatus(startupId, offerId, status);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}