package com.startupconnect.repository;

import com.startupconnect.model.InvestmentOffer;
import com.startupconnect.model.StartupProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestmentOfferRepository extends JpaRepository<InvestmentOffer, Long> {
    List<InvestmentOffer> findByStartup(StartupProfile startup);
    List<InvestmentOffer> findByStartupAndStatus(StartupProfile startup, InvestmentOffer.OfferStatus status);
} 