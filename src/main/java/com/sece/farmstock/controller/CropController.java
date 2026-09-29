package com.sece.farmstock.controller;

import com.sece.farmstock.entity.Crop;
import com.sece.farmstock.service.CropService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    @PostMapping
    public ResponseEntity<Crop> createCrop(
            @Valid @RequestBody Crop crop) {

        Crop savedCrop = cropService.createCrop(crop);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedCrop);
    }

    @GetMapping
    public ResponseEntity<List<Crop>> getAllCrops() {

        return ResponseEntity.ok(
                cropService.getAllCrops()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Crop> getCropById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                cropService.getCropById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Crop> updateCrop(
            @PathVariable Long id,
            @Valid @RequestBody Crop crop) {

        return ResponseEntity.ok(
                cropService.updateCrop(id, crop)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCrop(
            @PathVariable Long id) {

        cropService.deleteCrop(id);

        return ResponseEntity.noContent().build();
    }
}