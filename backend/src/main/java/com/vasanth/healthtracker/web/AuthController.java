package com.vasanth.healthtracker.web;

import com.vasanth.healthtracker.auth.JwtService;
import com.vasanth.healthtracker.model.AuthConfig;
import com.vasanth.healthtracker.repository.AuthConfigRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthConfigRepository repository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(AuthConfigRepository repository, JwtService jwtService) {
        this.repository = repository;
        this.jwtService = jwtService;
    }

    @GetMapping("/status")
    public Map<String, Boolean> status() {
        return Map.of("configured", repository.existsById(1L));
    }

    /** First run only: picks the PIN. Refuses once a PIN already exists. */
    @PostMapping("/setup")
    public ResponseEntity<Map<String, String>> setup(@RequestBody Map<String, String> body) {
        if (repository.existsById(1L)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        String pin = body.get("pin");
        if (pin == null || pin.length() < 4) {
            return ResponseEntity.badRequest().build();
        }
        repository.save(new AuthConfig(1L, encoder.encode(pin)));
        return ResponseEntity.ok(Map.of("token", jwtService.issueToken()));
    }

    /** Used both for the first login on a new device and for unlocking after the 5-minute lock. */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        AuthConfig config = repository.findById(1L).orElse(null);
        if (config == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        String pin = body.get("pin");
        if (pin == null || !encoder.matches(pin, config.getPinHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(Map.of("token", jwtService.issueToken()));
    }
}
