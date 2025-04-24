package com.startupconnect.model;

import java.math.BigDecimal;

public class InvestmentRequest {
    private Long offerId;
    private BigDecimal amount;

    public Long getOfferId() {
        return offerId;
    }
    public void setOfferId(Long offerId) {
        this.offerId = offerId;
    }
    public BigDecimal getAmount() {
        return amount;
    }
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
