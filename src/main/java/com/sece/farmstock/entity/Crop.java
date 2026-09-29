package com.sece.farmstock.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "crop")
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Crop name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Crop category is required")
    @Column(nullable = false)
    private String category;

    @JsonIgnore
@OneToMany(mappedBy = "crop")
private List<HarvestBatch> harvestBatches = new ArrayList<>();

@JsonIgnore
@OneToMany(mappedBy = "crop")
private List<Sale> sales = new ArrayList<>();

    public Crop() {
    }

    public Crop(String name, String category) {
        this.name = name;
        this.category = category;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<HarvestBatch> getHarvestBatches() {
        return harvestBatches;
    }

    public List<Sale> getSales() {
        return sales;
    }
}