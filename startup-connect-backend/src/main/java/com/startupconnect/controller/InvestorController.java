package com.startupconnect.controller;

import com.startupconnect.dto.InvestorDetailsDTO;
import com.startupconnect.service.InvestorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investors")
@CrossOrigin(origins = "http://localhost:3000")
public class InvestorController {

    @Autowired
    private InvestorService investorService;

    @GetMapping
    public ResponseEntity<List<InvestorDetailsDTO>> getAllInvestors() {
        return ResponseEntity.ok(investorService.getAllInvestorsWithDetails());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvestorDetailsDTO> getInvestorById(@PathVariable Long id) {
        return ResponseEntity.ok(investorService.getInvestorDetailsById(id));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<InvestorDetailsDTO> getInvestorDetails(@PathVariable Long id) {
        return ResponseEntity.ok(investorService.getInvestorDetailsById(id));
    }
} 