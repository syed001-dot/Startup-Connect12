package com.startupconnect.service;

import com.startupconnect.model.User;
import com.startupconnect.model.InvestorProfile;
import com.startupconnect.model.Transaction;
import com.startupconnect.repository.UserRepository;
import com.startupconnect.repository.InvestorProfileRepository;
import com.startupconnect.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvestorProfileRepository investorProfileRepository;

    @Autowired
    private TransactionRepository transactionRepository;

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
        userRepository.delete(user);
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