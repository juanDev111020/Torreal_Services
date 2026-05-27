package com.torreal.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.torreal.api.dto.PostulacionCreatedResponseDto;
import com.torreal.api.service.PostulacionService;

@RestController
public class PostulacionController {

  private final PostulacionService postulacionService;

  public PostulacionController(PostulacionService postulacionService) {
    this.postulacionService = postulacionService;
  }

  @PostMapping(value = "/api/postulaciones", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<PostulacionCreatedResponseDto> crear(
      @RequestParam("nombreCompleto") String nombreCompleto,
      @RequestParam("correoElectronico") String correoElectronico,
      @RequestParam(value = "cv", required = false) MultipartFile cv) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(postulacionService.crear(nombreCompleto, correoElectronico, cv));
  }
}
