package com.sece.farmstock.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RevenueResponse {

    private Long cropId;
    private String cropName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalRevenue;

    public RevenueResponse() {
    }

    public RevenueResponse(
            Long cropId,
            String cropName,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal totalRevenue) {

        this.cropId = cropId;
        this.cropName = cropName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalRevenue = totalRevenue;
    }

    public Long getCropId() {
        return cropId;
    }

    public String getCropName() {
        return cropName;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
}