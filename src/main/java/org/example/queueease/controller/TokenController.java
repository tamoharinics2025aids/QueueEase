package org.example.queueease.controller;

import org.example.queueease.entity.Token;
import org.example.queueease.service.TokenService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tokens")
public class TokenController {

    private final TokenService tokenService;

    public TokenController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    // CREATE TOKEN
    @PostMapping
    public Token createToken(
            @RequestParam Long doctorId,
            @RequestParam Long patientId,
            @RequestParam(defaultValue = "false") boolean priority) {

        return tokenService.createToken(
                doctorId,
                patientId,
                priority
        );
    }

    // GET ALL TOKENS
    @GetMapping
    public List<Token> getAllTokens() {
        return tokenService.getAllTokens();
    }

    // GET TODAY'S TOKENS FOR A DOCTOR
    @GetMapping("/doctor/{doctorId}")
    public List<Token> getTodayTokens(
            @PathVariable Long doctorId) {

        return tokenService.getTodayTokens(doctorId);
    }

    // SERVE NEXT TOKEN
    @PutMapping("/serve/{doctorId}")
    public Token serveNextToken(
            @PathVariable Long doctorId) {

        return tokenService.serveNextToken(doctorId);
    }
}