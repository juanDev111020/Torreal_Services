package com.torreal.api.exception;

import org.springframework.http.HttpStatus;

public class ApiBusinessException extends RuntimeException {

  private final HttpStatus status;

  public ApiBusinessException(HttpStatus status, String message) {
    super(message);
    this.status = status;
  }

  public HttpStatus getStatus() {
    return status;
  }
}
