package com.torreal.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.torreal.api.dto.AuthRegisterRequest;
import com.torreal.api.dto.ErrorResponseDto;
import com.torreal.api.dto.LoginRequestDto;
import com.torreal.api.dto.LoginResponseDto;
import com.torreal.api.dto.RegistroOkResponseDto;
import com.torreal.api.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  /**
   * Ayuda en Postman: muchos prueban GET por error; el login real es POST.
   */
  @GetMapping("/login")
  public ResponseEntity<ErrorResponseDto> loginMetodoIncorrecto() {
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
        .body(
            new ErrorResponseDto(
                "El inicio de sesión debe ser POST (no GET), con Content-Type: application/json y cuerpo "
                    + "{\"email\":\"...\",\"password\":\"...\"}."));
  }

  @PostMapping("/register")
  public ResponseEntity<RegistroOkResponseDto> register(@RequestBody AuthRegisterRequest body) {
    return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(body));
  }

  @PostMapping("/login")
  public LoginResponseDto login(@RequestBody LoginRequestDto body) {
    return authService.login(body);
  }
}
