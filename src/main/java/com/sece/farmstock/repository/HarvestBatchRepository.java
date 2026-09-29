package com.sece.farmstock.repository;

import com.sece.farmstock.entity.HarvestBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HarvestBatchRepository extends JpaRepository<HarvestBatch, Long> {

    List<HarvestBatch> findByCropId(Long cropId);
}