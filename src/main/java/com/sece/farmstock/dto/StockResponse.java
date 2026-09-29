package com.sece.farmstock.dto;

import java.math.BigDecimal;

public class StockResponse {

    private Long cropId;
    private String cropName;
    private BigDecimal totalHarvested;
    private BigDecimal totalSold;
    private BigDecimal currentStock;

    public StockResponse() {
    }

    public StockResponse(
            Long cropId,
            String cropName,
            BigDecimal totalHarvested,
            BigDecimal totalSold,
            BigDecimal currentStock) {

        this.cropId = cropId;
        this.cropName = cropName;
        this.totalHarvested = totalHarvested;
        this.totalSold = totalSold;
        this.currentStock = currentStock;
    }

    public Long getCropId() {
        return cropId;
    }

    public String getCropName() {
        return cropName;
    }

    public BigDecimal getTotalHarvested() {
        return totalHarvested;
    }

    public BigDecimal getTotalSold() {
        return totalSold;
    }

    public BigDecimal getCurrentStock() {
        return currentStock;
    }
}