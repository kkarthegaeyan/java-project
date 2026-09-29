package com.sece.farmstock.controller;

import com.sece.farmstock.entity.HarvestBatch;
import com.sece.farmstock.service.HarvestBatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/harvests")
public class HarvestBatchController {

    private final HarvestBatchService harvestBatchService;

    public HarvestBatchController(
            HarvestBatchService harvestBatchService) {

        this.harvestBatchService = harvestBatchService;
    }

    @PostMapping("/crop/{cropId}")
    public ResponseEntity<HarvestBatch> createHarvest(
            @PathVariable Long cropId,
            @Valid @RequestBody HarvestBatch harvestBatch) {

        HarvestBatch savedHarvest =
                harvestBatchService.createHarvest(
                        harvestBatch,
                        cropId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedHarvest);
    }

    @GetMapping
    public ResponseEntity<List<HarvestBatch>> getAllHarvests() {

        return ResponseEntity.ok(
                harvestBatchService.getAllHarvests()
        );
    }

    @GetMapping("/crop/{cropId}")
    public ResponseEntity<List<HarvestBatch>> getHarvestsByCrop(
            @PathVariable Long cropId) {

        return ResponseEntity.ok(
                harvestBatchService.getHarvestsByCrop(cropId)
        );
    }
}