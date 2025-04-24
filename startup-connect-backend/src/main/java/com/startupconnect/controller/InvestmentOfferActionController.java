package com.startupconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.startupconnect.service.InvestmentOfferService;

@RestController
@RequestMapping("/api/investment-offers")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class InvestmentOfferActionController {
    @Autowired
    private InvestmentOfferService investmentOfferService;

    @PostMapping("/{offerId}/accept")
    public ResponseEntity<?> acceptInvestmentOffer(@PathVariable Long offerId, java.security.Principal principal) {
        try {
            investmentOfferService.acceptOffer(offerId, principal.getName());
            return ResponseEntity.ok().body(java.util.Map.of("message", "Offer accepted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
