package com.startupconnect.dto;

public class InvestorDetailsDTO {
    private Long id;
    private String companyName;
    private String fullName;
    private String email;
    private String sector;
    private String investmentFocus;
    private String location;
    private String description;
    private Double investmentRangeMin;
    private Double investmentRangeMax;
    private Long userId;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getInvestmentFocus() {
        return investmentFocus;
    }

    public void setInvestmentFocus(String investmentFocus) {
        this.investmentFocus = investmentFocus;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getInvestmentRangeMin() {
        return investmentRangeMin;
    }

    public void setInvestmentRangeMin(Double investmentRangeMin) {
        this.investmentRangeMin = investmentRangeMin;
    }

    public Double getInvestmentRangeMax() {
        return investmentRangeMax;
    }

    public void setInvestmentRangeMax(Double investmentRangeMax) {
        this.investmentRangeMax = investmentRangeMax;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
} 