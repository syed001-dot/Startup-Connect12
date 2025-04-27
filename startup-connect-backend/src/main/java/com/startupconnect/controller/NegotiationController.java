package com.startupconnect.controller;

import com.startupconnect.dto.NegotiationOfferDTO;
import com.startupconnect.service.NegotiationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/negotiations")
public class NegotiationController {

    @Autowired
    private NegotiationService negotiationService;

    @PostMapping
    public ResponseEntity<NegotiationOfferDTO> createNegotiationOffer(@RequestBody NegotiationOfferDTO offerDTO) {
        NegotiationOfferDTO createdOffer = negotiationService.createNegotiationOffer(offerDTO);
        return ResponseEntity.ok(createdOffer);
    }

    @PutMapping("/{transactionId}")
    public ResponseEntity<NegotiationOfferDTO> updateNegotiationOffer(
            @PathVariable Long transactionId,
            @RequestBody NegotiationOfferDTO offerDTO) {
        NegotiationOfferDTO updatedOffer = negotiationService.updateNegotiationOffer(transactionId, offerDTO);
        return ResponseEntity.ok(updatedOffer);
    }

    @PostMapping("/{transactionId}/accept")
    public ResponseEntity<NegotiationOfferDTO> acceptNegotiationOffer(@PathVariable Long transactionId) {
        NegotiationOfferDTO acceptedOffer = negotiationService.acceptNegotiationOffer(transactionId);
        return ResponseEntity.ok(acceptedOffer);
    }

    @PostMapping("/{transactionId}/reject")
    public ResponseEntity<NegotiationOfferDTO> rejectNegotiationOffer(
            @PathVariable Long transactionId,
            @RequestParam String reason) {
        NegotiationOfferDTO rejectedOffer = negotiationService.rejectNegotiationOffer(transactionId, reason);
        return ResponseEntity.ok(rejectedOffer);
    }
} 