package com.startupconnect.service;

import com.startupconnect.dto.NegotiationOfferDTO;
import com.startupconnect.model.Transaction;
import com.startupconnect.model.StartupProfile;
import com.startupconnect.model.InvestorProfile;
import com.startupconnect.repository.TransactionRepository;
import com.startupconnect.repository.StartupProfileRepository;
import com.startupconnect.repository.InvestorProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Optional;

@Service
public class NegotiationService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private StartupProfileRepository startupProfileRepository;

    @Autowired
    private InvestorProfileRepository investorProfileRepository;

    @Transactional
    public NegotiationOfferDTO createNegotiationOffer(NegotiationOfferDTO offerDTO) {
        Optional<StartupProfile> startupOpt = startupProfileRepository.findById(offerDTO.getStartupId());
        Optional<InvestorProfile> investorOpt = investorProfileRepository.findById(offerDTO.getInvestorId());

        if (startupOpt.isEmpty() || investorOpt.isEmpty()) {
            throw new RuntimeException("Startup or Investor not found");
        }

        Transaction transaction = new Transaction();
        transaction.setStartup(startupOpt.get());
        transaction.setInvestor(investorOpt.get());
        transaction.setProposedAmount(offerDTO.getProposedAmount());
        transaction.setEquityPercentage(offerDTO.getEquityPercentage());
        transaction.setNegotiationStatus("PENDING");
        transaction.setNegotiationRound(1);
        transaction.setIsCounterOffer(false);
        transaction.setNegotiationNotes(offerDTO.getNotes());
        
        transaction = transactionRepository.save(transaction);
        return convertToDTO(transaction);
    }

    @Transactional
    public NegotiationOfferDTO updateNegotiationOffer(Long transactionId, NegotiationOfferDTO offerDTO) {
        Optional<Transaction> optionalTransaction = transactionRepository.findById(transactionId);
        if (optionalTransaction.isPresent()) {
            Transaction transaction = optionalTransaction.get();
            
            // Update negotiation details
            transaction.setProposedAmount(offerDTO.getProposedAmount());
            transaction.setEquityPercentage(offerDTO.getEquityPercentage());
            transaction.setNegotiationStatus(offerDTO.getStatus());
            transaction.setNegotiationNotes(offerDTO.getNotes());
            transaction.setIsCounterOffer(true);
            transaction.setNegotiationRound(transaction.getNegotiationRound() + 1);
            
            if ("REJECTED".equals(offerDTO.getStatus())) {
                transaction.setRejectionReason(offerDTO.getRejectionReason());
            }
            
            transaction = transactionRepository.save(transaction);
            return convertToDTO(transaction);
        }
        throw new RuntimeException("Transaction not found");
    }

    @Transactional
    public NegotiationOfferDTO acceptNegotiationOffer(Long transactionId) {
        Optional<Transaction> optionalTransaction = transactionRepository.findById(transactionId);
        if (optionalTransaction.isPresent()) {
            Transaction transaction = optionalTransaction.get();
            transaction.setNegotiationStatus("ACCEPTED");
            transaction = transactionRepository.save(transaction);
            return convertToDTO(transaction);
        }
        throw new RuntimeException("Transaction not found");
    }

    @Transactional
    public NegotiationOfferDTO rejectNegotiationOffer(Long transactionId, String reason) {
        Optional<Transaction> optionalTransaction = transactionRepository.findById(transactionId);
        if (optionalTransaction.isPresent()) {
            Transaction transaction = optionalTransaction.get();
            transaction.setNegotiationStatus("REJECTED");
            transaction.setRejectionReason(reason);
            transaction = transactionRepository.save(transaction);
            return convertToDTO(transaction);
        }
        throw new RuntimeException("Transaction not found");
    }

    private NegotiationOfferDTO convertToDTO(Transaction transaction) {
        NegotiationOfferDTO dto = new NegotiationOfferDTO();
        dto.setId(transaction.getId());
        dto.setTransactionId(transaction.getId());
        dto.setStartupId(transaction.getStartup().getId());
        dto.setInvestorId(transaction.getInvestor().getId());
        dto.setProposedAmount(transaction.getProposedAmount());
        dto.setEquityPercentage(transaction.getEquityPercentage());
        dto.setStatus(transaction.getNegotiationStatus());
        dto.setNotes(transaction.getNegotiationNotes());
        dto.setIsCounterOffer(transaction.getIsCounterOffer());
        dto.setNegotiationRound(transaction.getNegotiationRound());
        dto.setLastUpdated(transaction.getLastNegotiationDate());
        dto.setStartupName(transaction.getStartup().getStartupName());
        String investorName = null;
        String investorCompanyName = null;
        if (transaction.getInvestor() != null && transaction.getInvestor().getUser() != null) {
            investorName = transaction.getInvestor().getUser().getFullName();
        }
        if (transaction.getInvestor() != null) {
            investorCompanyName = transaction.getInvestor().getCompanyName();
        }
        dto.setInvestorName(investorName);
        dto.setRejectionReason(transaction.getRejectionReason());
        return dto;
    }
} 