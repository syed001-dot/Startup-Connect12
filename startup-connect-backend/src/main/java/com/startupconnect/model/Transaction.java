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

    @PrePersist
    protected void onCreate() {
        if (transactionDate == null) {
            transactionDate = ZonedDateTime.now(java.time.ZoneOffset.UTC);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // No need to update the transaction date on updates
    }
} 