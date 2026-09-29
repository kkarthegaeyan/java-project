package com.sece.farmstock.service;
import com.sece.farmstock.exception.ResourceNotFoundException;

import com.sece.farmstock.entity.Crop;
import com.sece.farmstock.entity.HarvestBatch;
import com.sece.farmstock.repository.CropRepository;
import com.sece.farmstock.repository.HarvestBatchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HarvestBatchService {

    private final HarvestBatchRepository harvestBatchRepository;
    private final CropRepository cropRepository;

    public HarvestBatchService(
            HarvestBatchRepository harvestBatchRepository,
            CropRepository cropRepository) {

        this.harvestBatchRepository = harvestBatchRepository;
        this.cropRepository = cropRepository;
    }

    public HarvestBatch createHarvest(
            HarvestBatch harvestBatch,
            Long cropId) {

        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Crop not found with id: " + cropId));

        harvestBatch.setCrop(crop);

        return harvestBatchRepository.save(harvestBatch);
    }

    public List<HarvestBatch> getAllHarvests() {
        return harvestBatchRepository.findAll();
    }

    public List<HarvestBatch> getHarvestsByCrop(Long cropId) {

        if (!cropRepository.existsById(cropId)) {
            throw new RuntimeException(
                    "Crop not found with id: " + cropId);
        }

        return harvestBatchRepository.findByCropId(cropId);
    }
}