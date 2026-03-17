package com.htut.cms.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/png", "image/jpeg", "image/jpg", "image/webp");
    private static final long MAX_BYTES = 5 * 1024 * 1024; // 5MB
    private static final Path BASE_DIR = Paths.get(System.getProperty("user.dir"), "uploads");

    public String storeImage(MultipartFile file, String subfolder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("File size exceeds 5MB limit.");
        }
        String contentType = file.getContentType();
        if (contentType == null || ALLOWED_IMAGE_TYPES.stream().noneMatch(contentType::equalsIgnoreCase)) {
            throw new IllegalArgumentException("Only PNG, JPG, or WEBP images are allowed.");
        }

        String extension = extractExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

        Path targetDir = BASE_DIR.resolve(subfolder);
        Files.createDirectories(targetDir);
        Path target = targetDir.resolve(filename);
        Files.copy(file.getInputStream(), target);

        // Public URL served via WebConfig
        return "/uploads/" + subfolder + "/" + filename;
    }

    private String extractExtension(String originalName) {
        if (originalName == null) {
            return "";
        }
        int dot = originalName.lastIndexOf('.');
        if (dot == -1 || dot == originalName.length() - 1) {
            return "";
        }
        return originalName.substring(dot + 1);
    }
}

