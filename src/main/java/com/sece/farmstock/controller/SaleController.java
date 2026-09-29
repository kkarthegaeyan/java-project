package com.sece.farmstock.controller;

import com.sece.farmstock.entity.Sale;
import com.sece.farmstock.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDate;
import java.math.BigDecimal;
import com.sece.farmstock.dto.StockResponse;
import com.sece.farmstock.dto.RevenueResponse;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping("/crop/{cropId}")
    public ResponseEntity<Sale> createSale(
            @PathVariable Long cropId,
            @Valid @RequestBody Sale sale) {

        Sale savedSale =
                saleService.createSale(sale, cropId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedSale);
    }

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {

        return ResponseEntity.ok(
                saleService.getAllSales()
        );
    }

    @GetMapping("/crop/{cropId}")
    public ResponseEntity<List<Sale>> getSalesByCrop(
            @PathVariable Long cropId) {

        return ResponseEntity.ok(
                saleService.getSalesByCrop(cropId)
        );
    }

    @GetMapping("/crop/{cropId}/stock")
public ResponseEntity<StockResponse> getCurrentStock(
        @PathVariable Long cropId) {

    return ResponseEntity.ok(
            saleService.getCurrentStock(cropId)
    );
}

@GetMapping("/crop/{cropId}/revenue")
public ResponseEntity<RevenueResponse> getRevenue(
        @PathVariable Long cropId,
        @RequestParam LocalDate startDate,
        @RequestParam LocalDate endDate) {

    RevenueResponse revenue =
            saleService.getRevenue(
                    cropId,
                    startDate,
                    endDate
            );

    return ResponseEntity.ok(revenue);
}
}