package com.startupconnect.service;

import com.startupconnect.model.Transaction;
import com.startupconnect.repository.TransactionRepository;
import com.startupconnect.model.InvestorProfile;
import com.startupconnect.model.StartupProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    public List<Transaction> getTransactionsByInvestor(InvestorProfile investor) {
        return transactionRepository.findAll().stream()
                .filter(t -> t.getInvestor().equals(investor))
                .toList();
    }

    public List<Transaction> getTransactionsByStartup(StartupProfile startup) {
        return transactionRepository.findAll().stream()
                .filter(t -> t.getStartup().equals(startup))
                .toList();
    }

    public Transaction updateTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }
}
