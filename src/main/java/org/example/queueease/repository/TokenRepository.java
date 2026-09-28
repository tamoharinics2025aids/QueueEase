package org.example.queueease.repository;

import org.example.queueease.entity.Doctor;
import org.example.queueease.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TokenRepository extends JpaRepository<Token, Long> {

    List<Token> findByDoctorAndTokenDateOrderByTokenNumberAsc(
            Doctor doctor,
            LocalDate tokenDate
    );

    List<Token> findByDoctorAndTokenDateAndStatusOrderByTokenNumberAsc(
            Doctor doctor,
            LocalDate tokenDate,
            String status
    );
}