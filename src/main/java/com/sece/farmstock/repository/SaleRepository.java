package com.sece.farmstock.repository;

import com.sece.farmstock.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Get all sales for a particular crop
    List<Sale> findByCropId(Long cropId);

    // Calculate total revenue for a crop within a date range
    @Query("""
            SELECT COALESCE(SUM(s.quantity * s.pricePerUnit), 0)
            FROM Sale s
            WHERE s.crop.id = :cropId
            AND s.saleDate BETWEEN :startDate AND :endDate
            """)
    BigDecimal calculateRevenue(
            @Param("cropId") Long cropId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}