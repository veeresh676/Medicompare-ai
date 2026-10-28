package com.medicompare.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public Path getUploadPath() {
        return Path.of(uploadDir)
                .toAbsolutePath()
                .normalize();
    }

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        String uploadLocation =
                getUploadPath()
                        .toUri()
                        .toString();

        registry.addResourceHandler(
                        "/uploads/**"
                )
                .addResourceLocations(
                        uploadLocation
                );
    }
}