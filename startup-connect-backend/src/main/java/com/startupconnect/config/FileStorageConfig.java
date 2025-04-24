package com.startupconnect.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@PropertySource("classpath:application.properties")
public class FileStorageConfig {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            System.out.println("Initializing upload directory: " + uploadPath);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory: " + uploadPath);
            } else {
                System.out.println("Upload directory already exists: " + uploadPath);
            }
            
            // Check if directory is writable
            if (!Files.isWritable(uploadPath)) {
                System.err.println("WARNING: Upload directory is not writable: " + uploadPath);
                System.err.println("Please check permissions on the directory.");
            } else {
                System.out.println("Upload directory is writable: " + uploadPath);
            }
            
            // Create a test file to verify write permissions
            Path testFile = uploadPath.resolve("test.txt");
            try {
                Files.writeString(testFile, "Test write permission");
                Files.delete(testFile);
                System.out.println("Write permission test passed");
            } catch (IOException e) {
                System.err.println("WARNING: Cannot write to upload directory: " + e.getMessage());
            }
        } catch (IOException e) {
            System.err.println("Could not create upload directory: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 