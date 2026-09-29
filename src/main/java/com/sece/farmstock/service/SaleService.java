package com.sece.farmstock.service;

import com.sece.farmstock.dto.StockResponse;
import com.sece.farmstock.entity.Crop;
import com.sece.farmstock.entity.HarvestBatch;
import com.sece.farmstock.entity.Sale;
import com.sece.farmstock.exception.InsufficientStockException;
import com.sece.farmstock.exception.ResourceNotFoundException;
import com.sece.farmstock.repository.CropRepository;
import com.sece.farmstock.repository.HarvestBatchRepository;
import com.sece.farmstock.repository.SaleRepository;
import org.springframework.stereotype.Service;
import com.sece.farmstock.dto.RevenueResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final HarvestBatchRepository harvestBatchRepository;
    private final CropRepository cropRepository;

    public SaleService(
            SaleRepository saleRepository,
            HarvestBatchRepository harvestBatchRepository,
            CropRepository cropRepository) {

        this.saleRepository = saleRepository;
        this.harvestBatchRepository = harvestBatchRepository;
        this.cropRepository = cropRepository;
    }

    // =========================================================
    // CREATE SALE
    // =========================================================

    public Sale createSale(Sale sale, Long cropId) {

        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Crop not found with id: " + cropId));

        BigDecimal totalHarvested =
                harvestBatchRepository
                        .findByCropId(cropId)
                        .stream()
                        .map(HarvestBatch::getQuantity)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSold =
                saleRepository
                        .findByCropId(cropId)
                        .stream()
                        .map(Sale::getQuantity)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentStock =
                totalHarvested.subtract(totalSold);

        // Prevent selling more than available stock
        if (sale.getQuantity().compareTo(currentStock) > 0) {

            throw new InsufficientStockException(
                    currentStock,
                    sale.getQuantity()
            );
        }

        sale.setCrop(crop);

        return saleRepository.save(sale);
    }

    // =========================================================
    // GET ALL SALES
    // =========================================================

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    // =========================================================
    // GET SALES BY CROP
    // =========================================================

    public List<Sale> getSalesByCrop(Long cropId) {

        if (!cropRepository.existsById(cropId)) {

            throw new ResourceNotFoundException(
                    "Crop not found with id: " + cropId);
        }

        return saleRepository.findByCropId(cropId);
    }

    // =========================================================
    // GET CURRENT STOCK
    // =========================================================

    public StockResponse getCurrentStock(Long cropId) {

        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Crop not found with id: " + cropId));

        BigDecimal totalHarvested =
                harvestBatchRepository
                        .findByCropId(cropId)
                        .stream()
                        .map(HarvestBatch::getQuantity)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSold =
                saleRepository
                        .findByCropId(cropId)
                        .stream()
                        .map(Sale::getQuantity)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentStock =
                totalHarvested.subtract(totalSold);

        return new StockResponse(
                crop.getId(),
                crop.getName(),
                totalHarvested,
                totalSold,
                currentStock
        );
    }

    // =========================================================
    // CALCULATE REVENUE
    // =========================================================

    public RevenueResponse getRevenue(
        Long cropId,
        LocalDate startDate,
        LocalDate endDate)  {

        // Check whether crop exists
        if (!cropRepository.existsById(cropId)) {

            throw new ResourceNotFoundException(
                    "Crop not found with id: " + cropId);
        }

        // Validate date range
        if (startDate.isAfter(endDate)) {

            throw new IllegalArgumentException(
                    "Start date cannot be after end date");
        }

        // Calculate revenue using SaleRepository
        BigDecimal totalRevenue =
        saleRepository.calculateRevenue(
                cropId,
                startDate,
                endDate
        );

Crop crop = cropRepository.findById(cropId)
        .orElseThrow(() ->
                new ResourceNotFoundException(
                        "Crop not found with id: " + cropId));

return new RevenueResponse(
        crop.getId(),
        crop.getName(),
        startDate,
        endDate,
        totalRevenue
);
    }
}