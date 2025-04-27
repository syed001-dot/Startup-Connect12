package com.startupconnect.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "investor_id", nullable = false)
    private InvestorProfile investor;

    @ManyToOne
    @JoinColumn(name = "startup_id", nullable = false)
    private StartupProfile startup;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private ZonedDateTime transactionDate;

    @Column
    private String transactionType;

    @Column
    private String description;

    // New negotiation-related fields
    @Column
    private Double proposedAmount;

    @Column
    private Double equityPercentage;

    @Column
    private String negotiationStatus;

    @Column
    private Integer negotiationRound;

    @Column
    private ZonedDateTime lastNegotiationDate;

    @Column
    private String negotiationNotes;

    @Column
    private Boolean isCounterOffer;

    @Column
    private String rejectionReason;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public InvestorProfile getInvestor() {
        return investor;
    }

    public void setInvestor(InvestorProfile investor) {
        this.investor = investor;
    }

    public StartupProfile getStartup() {
        return startup;
    }

    public void setStartup(StartupProfile startup) {
        this.startup = startup;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public ZonedDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(ZonedDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // New getters and setters for negotiation fields
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

    public String getNegotiationStatus() {
        return negotiationStatus;
    }

    public void setNegotiationStatus(String negotiationStatus) {
        this.negotiationStatus = negotiationStatus;
    }

    public Integer getNegotiationRound() {
        return negotiationRound;
    }

    public void setNegotiationRound(Integer negotiationRound) {
        this.negotiationRound = negotiationRound;
    }

    public ZonedDateTime getLastNegotiationDate() {
        return lastNegotiationDate;
    }

    public void setLastNegotiationDate(ZonedDateTime lastNegotiationDate) {
        this.lastNegotiationDate = lastNegotiationDate;
    }

    public String getNegotiationNotes() {
        return negotiationNotes;
    }

    public void setNegotiationNotes(String negotiationNotes) {
        this.negotiationNotes = negotiationNotes;
    }

    public Boolean getIsCounterOffer() {
        return isCounterOffer;
    }

    public void setIsCounterOffer(Boolean isCounterOffer) {
        this.isCounterOffer = isCounterOffer;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    @PrePersist
    protected void onCreate() {
        if (transactionDate == null) {
            transactionDate = ZonedDateTime.now(java.time.ZoneOffset.UTC);
        }
        if (negotiationStatus == null) {
            negotiationStatus = "PENDING";
        }
        if (negotiationRound == null) {
            negotiationRound = 1;
        }
        if (lastNegotiationDate == null) {
            lastNegotiationDate = ZonedDateTime.now(java.time.ZoneOffset.UTC);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastNegotiationDate = ZonedDateTime.now(java.time.ZoneOffset.UTC);
    }
} 