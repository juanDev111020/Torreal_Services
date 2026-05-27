package com.torreal.api.config;

import java.nio.file.Path;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.torreal.api.util.UploadsPathUtil;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final TorrealUploadsProperties uploadsProperties;

  public WebConfig(TorrealUploadsProperties uploadsProperties) {
    this.uploadsProperties = uploadsProperties;
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    Path root = UploadsPathUtil.raiz(uploadsProperties);
    String location =
        "file:"
            + root.toAbsolutePath().toString().replace('\\', '/')
            + (root.toString().endsWith("/") ? "" : "/");
    String prefix = uploadsProperties.getPublicPrefix();
    if (!prefix.startsWith("/")) {
      prefix = "/" + prefix;
    }
    registry.addResourceHandler(prefix + "/**").addResourceLocations(location);
  }
}
