package com.torreal.api.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.torreal.api.dto.HealthResponseDto;
import com.torreal.api.service.HealthService;

@RestController
public class HealthController {

  private final HealthService healthService;

  public HealthController(HealthService healthService) {
    this.healthService = healthService;
  }

  @GetMapping("/api/health")
  public ResponseEntity<Object> health() {
    HealthResponseDto h = healthService.health();
    if (!h.db()) {
      return ResponseEntity.status(500)
          .body(
              Map.of(
                  "status",
                  "error",
                  "message",
                  "No se pudo consultar la base de datos."));
    }
    return ResponseEntity.ok(h);
  }
}
