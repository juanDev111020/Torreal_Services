package com.torreal.api.service;

import com.torreal.api.dto.AuthRegisterRequest;
import com.torreal.api.dto.LoginRequestDto;
import com.torreal.api.dto.LoginResponseDto;
import com.torreal.api.dto.RegistroOkResponseDto;

public interface AuthService {

  LoginResponseDto login(LoginRequestDto request);

  RegistroOkResponseDto register(AuthRegisterRequest request);
}
