package com.startupconnect.controller;

import com.startupconnect.model.Transaction;
import com.startupconnect.dto.TransactionDTO;
import com.startupconnect.service.TransactionService;
import com.startupconnect.model.InvestorProfile;
import com.startupconnect.model.StartupProfile;
import com.startupconnect.repository.InvestorProfileRepository;
import com.startupconnect.repository.StartupProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private InvestorProfileRepository investorProfileRepository;
    @Autowired
    private StartupProfileRepository startupProfileRepository;
    @Autowired
    private com.startupconnect.service.UserService userService;

    @PostMapping
    public TransactionDTO createTransaction(@RequestBody TransactionDTO dto) {
        // Use authenticated user to determine investor
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String email = authentication.getName();
        com.startupconnect.model.User user = userService.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Authenticated user not found");
        }
        InvestorProfile investor = userService.getInvestorProfileByUserId(user.getId());
        if (investor == null) {
            throw new RuntimeException("Investor profile not found for user");
        }
        StartupProfile startup = startupProfileRepository.findById(dto.getStartupId()).orElse(null);
        if (startup == null) {
            throw new RuntimeException("Startup profile not found for id: " + dto.getStartupId());
        }
        Transaction transaction = new Transaction();
        transaction.setInvestor(investor);
        transaction.setStartup(startup);
        transaction.setAmount(dto.getAmount());
        transaction.setStatus(dto.getStatus());
        transaction.setTransactionDate(dto.getTransactionDate());
        transaction.setTransactionType(dto.getTransactionType());
        transaction.setDescription(dto.getDescription());
        Transaction saved = transactionService.createTransaction(transaction);
        dto.setId(saved.getId());
        dto.setInvestorId(investor.getId()); // Ensure DTO reflects the correct investor
        return dto;
    }

    @GetMapping
    public List<TransactionDTO> getAllTransactions() {
        return transactionService.getAllTransactions().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/investor/{investorId}")
    public List<TransactionDTO> getTransactionsByInvestor(@PathVariable Long investorId) {
        InvestorProfile investor = investorProfileRepository.findById(investorId).orElse(null);
        return transactionService.getTransactionsByInvestor(investor).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/startup/{startupId}")
    public List<TransactionDTO> getTransactionsByStartup(@PathVariable Long startupId) {
        StartupProfile startup = startupProfileRepository.findById(startupId).orElse(null);
        return transactionService.getTransactionsByStartup(startup).stream().map(this::toDTO).collect(Collectors.toList());
    }

    private TransactionDTO toDTO(Transaction t) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(t.getId());
        dto.setInvestorId(t.getInvestor() != null ? t.getInvestor().getId() : null);
        dto.setStartupId(t.getStartup() != null ? t.getStartup().getId() : null);
        dto.setAmount(t.getAmount());
        dto.setStatus(t.getStatus());
        dto.setTransactionDate(t.getTransactionDate());
        dto.setTransactionType(t.getTransactionType());
        dto.setDescription(t.getDescription());
        
        // Add investor details
        if (t.getInvestor() != null) {
            dto.setInvestorName(t.getInvestor().getUser().getFullName());
            dto.setInvestorCompanyName(t.getInvestor().getCompanyName());
        }
        
        // Add startup details
        if (t.getStartup() != null) {
            dto.setStartupName(t.getStartup().getStartupName());
            dto.setStartupStage(t.getStartup().getFundingStage());
        }
        
        return dto;
    }
}
