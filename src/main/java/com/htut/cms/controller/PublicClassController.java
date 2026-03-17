package com.htut.cms.controller;

import com.htut.cms.dto.response.ClassResponse;
import com.htut.cms.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

// Note: original public class endpoints already exist in PublicController.
// This controller is kept but remapped to avoid duplicate handler collisions.
@RestController
@RequestMapping("/api/v1/public/classes-alt")
@RequiredArgsConstructor
public class PublicClassController {

    private final ClassService classService;

    @GetMapping
    public ResponseEntity<List<ClassResponse>> list() {
        return ResponseEntity.ok(classService.getVisibleClasses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassResponse> detail(@PathVariable("id") String id) {
        return ResponseEntity.ok(classService.getPublicClassDetail(UUID.fromString(id)));
    }
}

