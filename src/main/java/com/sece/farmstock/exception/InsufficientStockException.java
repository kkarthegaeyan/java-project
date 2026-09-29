package com.sece.farmstock.exception;

import java.math.BigDecimal;

public class InsufficientStockException extends RuntimeException {

    private final BigDecimal availableStock;
    private final BigDecimal requestedQuantity;

    public InsufficientStockException(
            BigDecimal availableStock,
            BigDecimal requestedQuantity) {

        super(
                "Insufficient stock. Available stock: "
                        + availableStock
                        + ", requested quantity: "
                        + requestedQuantity
        );

        this.availableStock = availableStock;
        this.requestedQuantity = requestedQuantity;
    }

    public BigDecimal getAvailableStock() {
        return availableStock;
    }

    public BigDecimal getRequestedQuantity() {
        return requestedQuantity;
    }
}