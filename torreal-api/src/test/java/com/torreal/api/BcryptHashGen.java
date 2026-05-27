package com.torreal.api;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/** Ejecutar: mvn -q test-compile exec:java -Dexec.mainClass=com.torreal.api.BcryptHashGen */
public class BcryptHashGen {

  public static void main(String[] args) {
    System.out.println(new BCryptPasswordEncoder().encode("Torreal@Super2026"));
  }
}
