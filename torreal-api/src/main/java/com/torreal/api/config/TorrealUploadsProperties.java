package com.torreal.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "torreal.uploads")
public class TorrealUploadsProperties {

  private String dir = "./uploads";
  private String publicPrefix = "/uploads";

  public String getDir() {
    return dir;
  }

  public void setDir(String dir) {
    this.dir = dir;
  }

  public String getPublicPrefix() {
    return publicPrefix;
  }

  public void setPublicPrefix(String publicPrefix) {
    this.publicPrefix = publicPrefix;
  }
}
