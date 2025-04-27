package com.startupconnect.service;

import com.startupconnect.model.User;
import com.startupconnect.model.UserRole;
import com.startupconnect.model.InvestorProfile;
import com.startupconnect.model.InvestmentOffer;
import com.startupconnect.model.PitchDeck;
import com.startupconnect.model.Transaction;
import com.startupconnect.repository.UserRepository;
import com.startupconnect.repository.InvestorProfileRepository;
import com.startupconnect.repository.InvestmentOfferRepository;
import com.startupconnect.repository.PitchDeckRepository;
import com.startupconnect.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvestorProfileRepository investorProfileRepository;

    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private PitchDeckRepository pitchDeckRepository;
    
    @Autowired
    private InvestmentOfferRepository investmentOfferRepository;

    // User management methods
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setEmail(userDetails.getEmail());
        user.setFullName(userDetails.getFullName());
        user.setRole(userDetails.getRole());
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        
        try {
            // Handle related entities based on user role
            if (user.getRole() == UserRole.STARTUP && user.getStartupProfile() != null) {
                // Find and delete any investment offers related to this startup
                List<InvestmentOffer> startupOffers = investmentOfferRepository.findByStartup(user.getStartupProfile());
                if (!startupOffers.isEmpty()) {
                    System.out.println("Deleting " + startupOffers.size() + " investment offers for startup: " + user.getStartupProfile().getId());
                    investmentOfferRepository.deleteAll(startupOffers);
                }
                
                // Find and delete any pitch decks related to this startup
                List<PitchDeck> startupPitchDecks = pitchDeckRepository.findByStartup(user.getStartupProfile());
                if (!startupPitchDecks.isEmpty()) {
                    System.out.println("Deleting " + startupPitchDecks.size() + " pitch decks for startup: " + user.getStartupProfile().getId());
                    pitchDeckRepository.deleteAll(startupPitchDecks);
                }
                
                // Find and delete any transactions related to this startup
                List<Transaction> startupTransactions = transactionRepository.findAll().stream()
                    .filter(t -> t.getStartup() != null && t.getStartup().getId().equals(user.getStartupProfile().getId()))
                    .toList();
                
                if (!startupTransactions.isEmpty()) {
                    System.out.println("Deleting " + startupTransactions.size() + " transactions for startup: " + user.getStartupProfile().getId());
                    transactionRepository.deleteAll(startupTransactions);
                }
                
                // The startup profile will be deleted automatically due to CascadeType.ALL
            } else if (user.getRole() == UserRole.INVESTOR && user.getInvestorProfile() != null) {
                // Find and delete any transactions related to this investor
                List<Transaction> investorTransactions = transactionRepository.findAll().stream()
                    .filter(t -> t.getInvestor() != null && t.getInvestor().getId().equals(user.getInvestorProfile().getId()))
                    .toList();
                
                if (!investorTransactions.isEmpty()) {
                    System.out.println("Deleting " + investorTransactions.size() + " transactions for investor: " + user.getInvestorProfile().getId());
                    transactionRepository.deleteAll(investorTransactions);
                }
                
                // The investor profile will be deleted automatically due to CascadeType.ALL
            }
            
            // Now delete the user
            userRepository.delete(user);
            
            System.out.println("User deleted successfully: " + id);
        } catch (Exception e) {
            System.err.println("Error deleting user: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to maintain transaction behavior
        }
    }

    // Investor management methods
    public List<InvestorProfile> getAllInvestors() {
        return investorProfileRepository.findAll();
    }

    public InvestorProfile getInvestorById(Long id) {
        return investorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investor not found with id: " + id));
    }

    @Transactional
    public InvestorProfile updateInvestor(Long id, InvestorProfile investorDetails) {
        InvestorProfile investor = getInvestorById(id);
        investor.setCompanyName(investorDetails.getCompanyName());
        investor.setSector(investorDetails.getSector());
        investor.setInvestmentRangeMin(investorDetails.getInvestmentRangeMin());
        investor.setInvestmentRangeMax(investorDetails.getInvestmentRangeMax());
        investor.setLocation(investorDetails.getLocation());
        investor.setInvestmentFocus(investorDetails.getInvestmentFocus());
        investor.setDescription(investorDetails.getDescription());
        return investorProfileRepository.save(investor);
    }

    @Transactional
    public void deleteInvestor(Long id) {
        InvestorProfile investor = getInvestorById(id);
        investorProfileRepository.delete(investor);
    }

    // Transaction methods
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
    }
} 