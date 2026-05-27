package com.torreal.api.service;

import org.springframework.web.multipart.MultipartFile;

import com.torreal.api.dto.PostulacionCreatedResponseDto;

public interface PostulacionService {

  PostulacionCreatedResponseDto crear(String nombreCompleto, String correoElectronico, MultipartFile cv);
}
