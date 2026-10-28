package com.medicompare.service;

import com.medicompare.config.FileStorageConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final FileStorageConfig fileStorageConfig;

    public FileStorageService(FileStorageConfig fileStorageConfig) {
        this.fileStorageConfig = fileStorageConfig;
    }

    public String storeHospitalImage(
            MultipartFile file
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Image file is required"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new IllegalArgumentException(
                    "Only image files are allowed"
            );
        }

        Path uploadPath =
                fileStorageConfig.getUploadPath()
                        .resolve("hospitals");

        Files.createDirectories(uploadPath);

        String originalFilename =
                file.getOriginalFilename();

        String extension = "";

        if (originalFilename != null &&
                originalFilename.contains(".")) {

            extension = originalFilename.substring(
                    originalFilename.lastIndexOf(".")
            );
        }

        String filename =
                UUID.randomUUID() + extension;

        Path targetPath =
                uploadPath.resolve(filename)
                        .normalize();

        if (!targetPath.startsWith(uploadPath)) {
            throw new IllegalArgumentException(
                    "Invalid file path"
            );
        }

        Files.copy(
                file.getInputStream(),
                targetPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        return "/uploads/hospitals/" + filename;
    }
}