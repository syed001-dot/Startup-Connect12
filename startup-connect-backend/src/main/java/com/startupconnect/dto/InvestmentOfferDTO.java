package com.startupconnect.dto;

import com.startupconnect.model.InvestmentOffer;

public class InvestmentOfferDTO {
    private Long id;
    private Long investorId;
    private Long startupId;
    private String investorCompanyName;
    private String investorName;
    private String status;
    private String description;
    private String terms;
    private String date;
    private Double amount;
    private Double equityPercentage;



    public InvestmentOfferDTO() {}

    public InvestmentOfferDTO(InvestmentOffer offer, String investorCompanyName) {
        this.id = offer.getId();
        this.investorId = offer.getInvestor() != null ? offer.getInvestor().getId() : null;
        this.startupId = offer.getStartup() != null ? offer.getStartup().getId() : null;
        this.investorCompanyName = investorCompanyName;
        this.status = offer.getStatus().name();
        this.description = offer.getDescription();
        this.terms = offer.getTerms();
        this.amount = offer.getAmount() != null ? offer.getAmount().doubleValue() : null;
        this.equityPercentage = offer.getEquityPercentage() != null ? offer.getEquityPercentage().doubleValue() : null;
        this.date = offer.getCreatedAt() != null ? offer.getCreatedAt().toString() : null;
        this.investorName = offer.getInvestor() != null ? offer.getInvestor().getFullName() : null;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getInvestorId() { return investorId; }
    public void setInvestorId(Long investorId) { this.investorId = investorId; }
    public Long getStartupId() { return startupId; }
    public void setStartupId(Long startupId) { this.startupId = startupId; }
    public String getInvestorCompanyName() { return investorCompanyName; }
    public void setInvestorCompanyName(String investorCompanyName) { this.investorCompanyName = investorCompanyName; }
    public String getInvestorName() { return investorName; }
    public void setInvestorName(String investorName) { this.investorName = investorName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTerms() { return terms; }
    public void setTerms(String terms) { this.terms = terms; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public Double getEquityPercentage() { return equityPercentage; }
    public void setEquityPercentage(Double equityPercentage) { this.equityPercentage = equityPercentage; }
}
