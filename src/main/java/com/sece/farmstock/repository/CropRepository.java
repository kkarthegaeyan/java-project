package com.sece.farmstock.repository;

import com.sece.farmstock.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CropRepository extends JpaRepository<Crop, Long> {
}