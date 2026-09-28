package org.example.queueease.service;

import org.example.queueease.entity.Doctor;
import org.example.queueease.entity.Patient;
import org.example.queueease.entity.Token;
import org.example.queueease.repository.DoctorRepository;
import org.example.queueease.repository.PatientRepository;
import org.example.queueease.repository.TokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TokenService {

    private final TokenRepository tokenRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public TokenService(TokenRepository tokenRepository,
                        DoctorRepository doctorRepository,
                        PatientRepository patientRepository) {
        this.tokenRepository = tokenRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public List<Token> getAllTokens() {
        return tokenRepository.findAll();
    }

    public Token createToken(Long doctorId,
                             Long patientId,
                             boolean priority) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        LocalDate today = LocalDate.now();

        List<Token> todayTokens =
                tokenRepository.findByDoctorAndTokenDateOrderByTokenNumberAsc(
                        doctor, today);

        if (priority) {

            boolean priorityWaiting = todayTokens.stream()
                    .anyMatch(token ->
                            token.isPriority()
                                    && "WAITING".equals(token.getStatus()));

            if (priorityWaiting) {
                throw new RuntimeException(
                        "Only one priority token can be waiting for a doctor");
            }
        }

        int nextTokenNumber = todayTokens.size() + 1;

        int waitingTokens = (int) todayTokens.stream()
                .filter(token -> "WAITING".equals(token.getStatus()))
                .count();

        int estimatedWait =
                waitingTokens * doctor.getAverageConsultationMinutes();

        Token token = new Token();

        token.setTokenNumber(nextTokenNumber);
        token.setTokenDate(today);
        token.setPriority(priority);
        token.setStatus("WAITING");
        token.setEstimatedWaitMinutes(estimatedWait);
        token.setDoctor(doctor);
        token.setPatient(patient);

        return tokenRepository.save(token);
    }

    public Token serveNextToken(Long doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        LocalDate today = LocalDate.now();

        List<Token> waitingTokens =
                tokenRepository
                        .findByDoctorAndTokenDateAndStatusOrderByTokenNumberAsc(
                                doctor,
                                today,
                                "WAITING");

        if (waitingTokens.isEmpty()) {
            throw new RuntimeException("No waiting tokens");
        }

        Token nextToken = waitingTokens.stream()
                .filter(Token::isPriority)
                .findFirst()
                .orElse(waitingTokens.get(0));

        nextToken.setStatus("SERVED");

        doctor.setCurrentServingTokenNumber(
                nextToken.getTokenNumber());

        doctorRepository.save(doctor);

        return tokenRepository.save(nextToken);
    }

    public List<Token> getTodayTokens(Long doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return tokenRepository
                .findByDoctorAndTokenDateOrderByTokenNumberAsc(
                        doctor,
                        LocalDate.now());
    }
}