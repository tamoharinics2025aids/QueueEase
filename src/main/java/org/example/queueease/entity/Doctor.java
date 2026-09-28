package org.example.queueease.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String specialization;

    private int averageConsultationMinutes;

    private int currentServingTokenNumber = 0;

    public Doctor() {
    }

    public Doctor(String name, String specialization, int averageConsultationMinutes) {
        this.name = name;
        this.specialization = specialization;
        this.averageConsultationMinutes = averageConsultationMinutes;
        this.currentServingTokenNumber = 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public int getAverageConsultationMinutes() {
        return averageConsultationMinutes;
    }

    public void setAverageConsultationMinutes(int averageConsultationMinutes) {
        this.averageConsultationMinutes = averageConsultationMinutes;
    }

    public int getCurrentServingTokenNumber() {
        return currentServingTokenNumber;
    }

    public void setCurrentServingTokenNumber(int currentServingTokenNumber) {
        this.currentServingTokenNumber = currentServingTokenNumber;
    }
}