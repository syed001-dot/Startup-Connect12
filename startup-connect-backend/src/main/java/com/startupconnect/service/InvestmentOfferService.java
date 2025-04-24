package com.startupconnect.service;

import com.startupconnect.model.User;
import com.startupconnect.repository.UserRepository;

import com.startupconnect.model.InvestmentOffer;
import com.startupconnect.model.StartupProfile;
import com.startupconnect.model.InvestorProfile;
import com.startupconnect.dto.InvestmentOfferDTO;
import com.startupconnect.repository.InvestmentOfferRepository;
import com.startupconnect.repository.StartupProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InvestmentOfferService {

    @Autowired
    private InvestmentOfferRepository investmentOfferRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StartupProfileRepository startupProfileRepository;

    @Autowired
    private com.startupconnect.repository.InvestorProfileRepository investorProfileRepository;

    @Transactional
    public InvestmentOffer createInvestmentOffer(Long startupId, InvestmentOffer offer) {
        StartupProfile startup = startupProfileRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found with id: " + startupId));

        offer.setStartup(startup);
        offer.setRemainingAmount(offer.getAmount());
        return investmentOfferRepository.save(offer);
    }

    public List<InvestmentOffer> getInvestmentOffersByStartup(Long startupId) {
        StartupProfile startup = startupProfileRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found with id: " + startupId));
        return investmentOfferRepository.findByStartupAndStatus(startup, InvestmentOffer.OfferStatus.ACTIVE);
    }

    @Transactional
    public void updateRemainingAmount(Long offerId, BigDecimal amount) {
        InvestmentOffer offer = investmentOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Investment offer not found with id: " + offerId));

        BigDecimal newRemainingAmount = offer.getRemainingAmount().subtract(amount);
        if (newRemainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Investment amount exceeds remaining amount");
        }

        offer.setRemainingAmount(newRemainingAmount);
        if (newRemainingAmount.compareTo(BigDecimal.ZERO) == 0) {
            offer.setStatus(InvestmentOffer.OfferStatus.CLOSED);
        }

        investmentOfferRepository.save(offer);
    }

    public void acceptOffer(Long offerId, String investorEmail) {
        InvestmentOffer offer = investmentOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Investment offer not found with id: " + offerId));
        if (offer.getStatus() == InvestmentOffer.OfferStatus.CLOSED) {
            throw new RuntimeException("Offer is already closed");
        }
        offer.setStatus(InvestmentOffer.OfferStatus.CLOSED);
        // Find the investor by email and set it
        User investor = userRepository.findByEmail(investorEmail)
                .orElseThrow(() -> new RuntimeException("Investor not found with email: " + investorEmail));
        offer.setInvestor(investor);
        investmentOfferRepository.save(offer);
    }

    public List<InvestmentOfferDTO> getOffersByStartup(Long startupId) {
        StartupProfile startup = startupProfileRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found"));
        List<InvestmentOffer> offers = investmentOfferRepository.findByStartup(startup);
        List<InvestmentOfferDTO> dtos = new java.util.ArrayList<>();
        for (InvestmentOffer offer : offers) {
            String investorCompanyName = null;
            String investorName = null;
            Long investorId = null;
            if (offer.getInvestor() != null) {
                investorId = offer.getInvestor().getId();
                investorName = offer.getInvestor().getFullName();
                InvestorProfile profile = investorProfileRepository.findByUserId(investorId).orElse(null);
                if (profile != null) {
                    investorCompanyName = profile.getCompanyName();
                }
            }
            InvestmentOfferDTO dto = new InvestmentOfferDTO(offer, investorCompanyName);
            dto.setInvestorName(investorName);
            dto.setInvestorId(offer.getInvestor() != null ? offer.getInvestor().getId() : null);
            dto.setStartupId(offer.getStartup() != null ? offer.getStartup().getId() : null);
            dtos.add(dto);
        }
        return dtos;
    }

    public List<InvestmentOffer> getActiveOffersByStartup(Long startupId) {
        StartupProfile startup = startupProfileRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found"));
        return investmentOfferRepository.findByStartupAndStatus(startup, InvestmentOffer.OfferStatus.ACTIVE);
    }

    @Transactional
    public InvestmentOffer createOffer(Long startupId, InvestmentOffer offer) {
        StartupProfile startup = startupProfileRepository.findById(startupId)
            .orElseThrow(() -> new RuntimeException("Startup not found"));
        
        offer.setStartup(startup);
        return investmentOfferRepository.save(offer);
    }

    @Transactional
    public InvestmentOffer updateOffer(Long startupId, Long offerId, InvestmentOffer offer) {
        StartupProfile startup = startupProfileRepository.findById(startupId)
            .orElseThrow(() -> new RuntimeException("Startup not found"));
        
        InvestmentOffer existingOffer = investmentOfferRepository.findById(offerId)
            .orElseThrow(() -> new RuntimeException("Offer not found"));
        
        if (!existingOffer.getStartup().getId().equals(startupId)) {
            throw new RuntimeException("Offer does not belong to this startup");
        }
        
        existingOffer.setAmount(offer.getAmount());
        existingOffer.setEquityPercentage(offer.getEquityPercentage());
        existingOffer.setDescription(offer.getDescription());
        existingOffer.setTerms(offer.getTerms());
        
        return investmentOfferRepository.save(existingOffer);
    }

    @Transactional
    public void deleteOffer(Long startupId, Long offerId) {
        StartupProfile startup = startupProfileRepository.findById(startupId)
            .orElseThrow(() -> new RuntimeException("Startup not found"));
        
        InvestmentOffer offer = investmentOfferRepository.findById(offerId)
            .orElseThrow(() -> new RuntimeException("Offer not found"));
        
        if (!offer.getStartup().getId().equals(startupId)) {
            throw new RuntimeException("Offer does not belong to this startup");
        }
        
        investmentOfferRepository.delete(offer);
    }

    @Transactional
    public void updateOfferStatus(Long startupId, Long offerId, InvestmentOffer.OfferStatus status) {
        InvestmentOffer offer = investmentOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (!offer.getStartup().getId().equals(startupId)) {
            throw new RuntimeException("Offer does not belong to this startup");
        }

        offer.setStatus(status);
        offer.setUpdatedAt(LocalDateTime.now());
        investmentOfferRepository.save(offer);
    }

    public void closeOffer(InvestmentOffer offer) {
        offer.setStatus(InvestmentOffer.OfferStatus.CLOSED);
        investmentOfferRepository.save(offer);
    }
} 