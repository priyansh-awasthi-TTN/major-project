package com.jobhuntly.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class FileUploadController {

    private final Path root = Paths.get("uploads");

    public FileUploadController() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
            }

            String origName = file.getOriginalFilename();
            String extension = origName != null && origName.contains(".") ? origName.substring(origName.lastIndexOf(".")) : "";
            // Keep file original name without spaces and append UUID to prevent override
            String cleanName = origName != null ? origName.replaceAll("\\s+", "_").replace(extension, "") : "file";
            String newName = cleanName + "_" + UUID.randomUUID().toString() + extension;
            Files.copy(file.getInputStream(), this.root.resolve(newName));
            String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(newName)
                    .toUriString();
            return ResponseEntity.ok(Map.of(
                    "url", url,
                    "fileName", origName != null ? origName : newName,
                    "contentType", file.getContentType(),
                    "size", file.getSize()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Could not upload the file: " + e.getMessage()));
        }
    }
}
