package com.torreal.api.exception;

import java.sql.SQLException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.multipart.MultipartException;

import com.torreal.api.dto.ErrorResponseDto;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ApiBusinessException.class)
  public ResponseEntity<ErrorResponseDto> handleApi(ApiBusinessException ex) {
    return ResponseEntity.status(ex.getStatus())
        .body(new ErrorResponseDto(ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponseDto> handleValidation(MethodArgumentNotValidException ex) {
    String msg =
        ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Solicitud inválida.")
            .orElse("Solicitud inválida.");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDto(msg));
  }

  @ExceptionHandler(MultipartException.class)
  public ResponseEntity<ErrorResponseDto> handleMultipart(MultipartException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponseDto("Envío inválido: el formulario debe ser multipart/form-data."));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ErrorResponseDto> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
        .body(
            new ErrorResponseDto(
                "Método HTTP no permitido ("
                    + ex.getMethod()
                    + "). Por ejemplo /api/auth/login solo acepta POST con JSON {\"email\":\"...\",\"password\":\"...\"}."));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErrorResponseDto> handleDup(DataIntegrityViolationException ex) {
    Throwable root = ex.getMostSpecificCause();
    if (isDuplicateKey(root)) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(new ErrorResponseDto("Ya existe una cuenta con ese correo."));
    }
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ErrorResponseDto("No se pudo completar el registro."));
  }

  @ExceptionHandler(DataAccessException.class)
  public ResponseEntity<ErrorResponseDto> handleDataAccess(DataAccessException ex) {
    log.error("Fallo de acceso a datos (revisa MySQL y application.properties)", ex);
    Throwable root = ex.getMostSpecificCause();
    String rootMsg =
        root != null && root.getMessage() != null ? root.getMessage().toLowerCase() : "";

    if (rootMsg.contains("communications link failure")
        || rootMsg.contains("connection refused")
        || rootMsg.contains("connect timed out")
        || rootMsg.contains("could not open jdbc connection")
        || rootMsg.contains("unknown host")) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(new ErrorResponseDto("No hay conexión con el servidor. Intenta de nuevo más tarde."));
    }
    if (rootMsg.contains("access denied for user") || rootMsg.contains("unknown database")) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponseDto("No se pudo completar la operación. Intenta de nuevo más tarde."));
    }

    if (root instanceof SQLException sql) {
      String state = sql.getSQLState();
      if ("42S22".equals(state)
          || "42S02".equals(state)
          || rootMsg.contains("unknown column")
          || rootMsg.contains("doesn't exist")) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponseDto("No se pudo completar la operación. Intenta de nuevo más tarde."));
      }
    }

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ErrorResponseDto("No se pudo completar la operación. Intenta de nuevo más tarde."));
  }

  private static boolean isDuplicateKey(Throwable root) {
    if (root instanceof SQLException sql && sql.getErrorCode() == 1062) {
      return true;
    }
    String m = root.getMessage();
    return m != null && (m.contains("Duplicate") || m.contains("duplicate"));
  }
}
