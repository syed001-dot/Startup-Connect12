package com.startupconnect.dto;

import java.time.ZonedDateTime;

public class TransactionDTO {
    private Long id;
    private Long investorId;
    private Long startupId;
    private Double amount;
    private String status;
    private ZonedDateTime transactionDate;
    private String transactionType;
    private String description;
    private String investorName;
    private String investorCompanyName;
    private String startupName;
    private String startupStage;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getInvestorId() { return investorId; }
    public void setInvestorId(Long investorId) { this.investorId = investorId; }
    public Long getStartupId() { return startupId; }
    public void setStartupId(Long startupId) { this.startupId = startupId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public ZonedDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(ZonedDateTime transactionDate) { this.transactionDate = transactionDate; }
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getInvestorName() { return investorName; }
    public void setInvestorName(String investorName) { this.investorName = investorName; }
    public String getInvestorCompanyName() { return investorCompanyName; }
    public void setInvestorCompanyName(String investorCompanyName) { this.investorCompanyName = investorCompanyName; }
    public String getStartupName() { return startupName; }
    public void setStartupName(String startupName) { this.startupName = startupName; }
    public String getStartupStage() { return startupStage; }
    public void setStartupStage(String startupStage) { this.startupStage = startupStage; }
}
