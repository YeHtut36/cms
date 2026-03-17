package com.htut.cms.controller;

import com.htut.cms.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/payment-proof")
    public ResponseEntity<UploadResponse> uploadPaymentProof(@RequestParam("file") MultipartFile file) throws Exception {
        String url = fileStorageService.storeImage(file, "payment-proof");
        return ResponseEntity.status(HttpStatus.CREATED).body(new UploadResponse(url));
    }

    @PostMapping("/kbz-qr")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UploadResponse> uploadKbzQr(@RequestParam("file") MultipartFile file) throws Exception {
        String url = fileStorageService.storeImage(file, "kbz-qr");
        return ResponseEntity.status(HttpStatus.CREATED).body(new UploadResponse(url));
    }

    public record UploadResponse(String url) { }
}

