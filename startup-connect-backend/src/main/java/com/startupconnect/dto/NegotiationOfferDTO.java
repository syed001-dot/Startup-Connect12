package com.startupconnect.dto;

import java.time.ZonedDateTime;

public class NegotiationOfferDTO {
    private Long id;
    private Long transactionId;
    private Long startupId;
    private Long investorId;
    private Double proposedAmount;
    private Double equityPercentage;
    private String status;
    private String notes;
    private Boolean isCounterOffer;
    private Integer negotiationRound;
    private ZonedDateTime lastUpdated;
    private String startupName;
    private String investorName;
    private String rejectionReason;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public Long getStartupId() {
        return startupId;
    }

    public void setStartupId(Long startupId) {
        this.startupId = startupId;
    }

    public Long getInvestorId() {
        return investorId;
    }

    public void setInvestorId(Long investorId) {
        this.investorId = investorId;
    }

    public Double getProposedAmount() {
        return proposedAmount;
    }

    public void setProposedAmount(Double proposedAmount) {
        this.proposedAmount = proposedAmount;
    }

    public Double getEquityPercentage() {
        return equityPercentage;
    }

    public void setEquityPercentage(Double equityPercentage) {
        this.equityPercentage = equityPercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getIsCounterOffer() {
        return isCounterOffer;
    }

    public void setIsCounterOffer(Boolean isCounterOffer) {
        this.isCounterOffer = isCounterOffer;
    }

    public Integer getNegotiationRound() {
        return negotiationRound;
    }

    public void setNegotiationRound(Integer negotiationRound) {
        this.negotiationRound = negotiationRound;
    }

    public ZonedDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(ZonedDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getStartupName() {
        return startupName;
    }

    public void setStartupName(String startupName) {
        this.startupName = startupName;
    }

    public String getInvestorName() {
        return investorName;
    }

    public void setInvestorName(String investorName) {
        this.investorName = investorName;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
} 