package com.startupconnect.controller;

import com.startupconnect.model.User;
import com.startupconnect.model.InvestorProfile;
import com.startupconnect.model.Transaction;
import com.startupconnect.dto.TransactionDTO;
import com.startupconnect.service.AdminService;
import com.startupconnect.service.TransactionService;
import com.startupconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;
    
    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private UserRepository userRepository;

    // User management endpoints
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(adminService.updateUser(id, user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
    
    // Temporary test endpoint for debugging
    @GetMapping("/test/delete-user/{id}")
    public ResponseEntity<String> testDeleteUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
            
            // Log user details before deletion
            System.out.println("Attempting to delete user: " + user.getId() + " - " + user.getEmail());
            
            // Try direct repository deletion
            userRepository.delete(user);
            userRepository.flush(); // Force immediate deletion
            
            return ResponseEntity.ok("User deleted successfully: " + id);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }

    // Investor management endpoints
    @GetMapping("/investors")
    public ResponseEntity<List<InvestorProfile>> getAllInvestors() {
        return ResponseEntity.ok(adminService.getAllInvestors());
    }

    @GetMapping("/investors/{id}")
    public ResponseEntity<InvestorProfile> getInvestorById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getInvestorById(id));
    }

    @PutMapping("/investors/{id}")
    public ResponseEntity<InvestorProfile> updateInvestor(@PathVariable Long id, @RequestBody InvestorProfile investor) {
        return ResponseEntity.ok(adminService.updateInvestor(id, investor));
    }

    @DeleteMapping("/investors/{id}")
    public ResponseEntity<Void> deleteInvestor(@PathVariable Long id) {
        adminService.deleteInvestor(id);
        return ResponseEntity.ok().build();
    }

    // Transaction endpoints
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        List<Transaction> transactions = adminService.getAllTransactions();
        List<TransactionDTO> dtos = transactions.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id) {
        Transaction transaction = adminService.getTransactionById(id);
        return ResponseEntity.ok(toDTO(transaction));
    }

    private TransactionDTO toDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setAmount(transaction.getAmount());
        dto.setStatus(transaction.getStatus());
        dto.setTransactionDate(transaction.getTransactionDate());
        dto.setTransactionType(transaction.getTransactionType());
        dto.setDescription(transaction.getDescription());

        // Set investor details
        if (transaction.getInvestor() != null) {
            dto.setInvestorId(transaction.getInvestor().getId());
            dto.setInvestorName(transaction.getInvestor().getUser().getFullName());
            dto.setInvestorCompanyName(transaction.getInvestor().getCompanyName());
        }

        // Set startup details
        if (transaction.getStartup() != null) {
            dto.setStartupId(transaction.getStartup().getId());
            dto.setStartupName(transaction.getStartup().getStartupName());
            dto.setStartupStage(transaction.getStartup().getFundingStage());
        }

        return dto;
    }
} 