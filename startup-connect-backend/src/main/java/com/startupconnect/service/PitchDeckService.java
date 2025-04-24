package com.startupconnect.service;

import com.startupconnect.model.PitchDeck;
import com.startupconnect.model.StartupProfile;
import com.startupconnect.repository.PitchDeckRepository;
import com.startupconnect.repository.StartupProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class PitchDeckService {

    @Autowired
    private PitchDeckRepository pitchDeckRepository;

    @Autowired
    private StartupProfileRepository startupProfileRepository;

    @Value("${app.upload.dir:${user.home}/startup-connect/uploads/pitchdecks}")
    private String uploadDir;

    public List<PitchDeck> getAllPitchDecks() {
        return pitchDeckRepository.findAll();
    }

    public PitchDeck getPitchDeckById(Long id) {
        return pitchDeckRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pitch deck not found with id: " + id));
    }

    public List<PitchDeck> getPitchDecksByStartup(Long startupId) {
        StartupProfile startup = startupProfileRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found with id: " + startupId));
        return pitchDeckRepository.findByStartup(startup);
    }

    public List<PitchDeck> getPublicPitchDecksByStartup(Long startupId) {
        StartupProfile startup = startupProfileRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found with id: " + startupId));
        return pitchDeckRepository.findByStartupAndIsPublic(startup, true);
    }

    @Transactional
    public PitchDeck uploadPitchDeck(Long startupId, MultipartFile file, String title, String description, Boolean isPublic) {
        try {
            System.out.println("Starting pitch deck upload process...");
            System.out.println("Startup ID: " + startupId);
            System.out.println("Title: " + title);
            System.out.println("Description: " + description);
            System.out.println("Is Public: " + isPublic);
            
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("File is empty or null");
            }

            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Title is required");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null) {
                throw new IllegalArgumentException("File content type is null");
            }
            
            System.out.println("File content type: " + contentType);
            System.out.println("File size: " + file.getSize());
            System.out.println("Original filename: " + file.getOriginalFilename());
            
            // Check if file type is allowed (PDF, PPT, PPTX)
            boolean isAllowedType = contentType.equals("application/pdf") || 
                                   contentType.equals("application/vnd.ms-powerpoint") || 
                                   contentType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation");
            
            if (!isAllowedType) {
                throw new IllegalArgumentException("File type not allowed. Please upload PDF, PPT, or PPTX files only.");
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            System.out.println("Attempting to use upload directory: " + uploadPath);
            
            if (!Files.exists(uploadPath)) {
                try {
                    Files.createDirectories(uploadPath);
                    System.out.println("Successfully created upload directory: " + uploadPath);
                } catch (IOException e) {
                    System.err.println("Failed to create upload directory: " + uploadPath);
                    System.err.println("Error: " + e.getMessage());
                    throw new RuntimeException("Failed to create upload directory: " + e.getMessage());
                }
            } else {
                System.out.println("Upload directory already exists: " + uploadPath);
                if (!Files.isWritable(uploadPath)) {
                    System.err.println("Upload directory is not writable: " + uploadPath);
                    throw new RuntimeException("Upload directory is not writable: " + uploadPath);
                }
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                throw new IllegalArgumentException("Original filename is null");
            }
            
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + fileExtension;
            
            // Save file to disk
            Path filePath = uploadPath.resolve(fileName);
            
            // Delete existing file if it exists (Windows fix)
            Files.deleteIfExists(filePath);
            
            // Copy the new file
            Files.copy(file.getInputStream(), filePath);
            System.out.println("File saved to: " + filePath);

            // Get startup profile
            StartupProfile startup = startupProfileRepository.findById(startupId)
                    .orElseThrow(() -> new RuntimeException("Startup not found with id: " + startupId));
            System.out.println("Found startup profile: " + startup.getId());

            // Create pitch deck entity
            PitchDeck pitchDeck = new PitchDeck();
            pitchDeck.setStartup(startup);
            pitchDeck.setTitle(title);
            pitchDeck.setDescription(description);
            pitchDeck.setFilePath(filePath.toString());
            pitchDeck.setFileName(originalFilename);
            pitchDeck.setFileSize(file.getSize());
            pitchDeck.setFileType(file.getContentType());
            pitchDeck.setIsPublic(isPublic != null ? isPublic : false);

            System.out.println("Pitch deck entity created with the following properties:");
            System.out.println("  - ID: " + pitchDeck.getId());
            System.out.println("  - Title: " + pitchDeck.getTitle());
            System.out.println("  - File Path: " + pitchDeck.getFilePath());
            System.out.println("  - File Name: " + pitchDeck.getFileName());
            System.out.println("  - File Size: " + pitchDeck.getFileSize());
            System.out.println("  - File Type: " + pitchDeck.getFileType());
            System.out.println("  - Is Public: " + pitchDeck.getIsPublic());

            // Save to database
            try {
                PitchDeck savedPitchDeck = pitchDeckRepository.save(pitchDeck);
                System.out.println("Pitch deck saved to database with ID: " + savedPitchDeck.getId());
                return savedPitchDeck;
            } catch (Exception e) {
                System.err.println("Error saving pitch deck to database: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to save pitch deck to database: " + e.getMessage());
            }
        } catch (IOException e) {
            System.err.println("IO Exception during file upload: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to upload pitch deck: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Exception during pitch deck upload: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to upload pitch deck: " + e.getMessage());
        }
    }

    @Transactional
    public PitchDeck updatePitchDeck(PitchDeck pitchDeck) {
        // Get existing pitch deck
        PitchDeck existingDeck = getPitchDeckById(pitchDeck.getId());
        
        // Update fields
        existingDeck.setTitle(pitchDeck.getTitle());
        existingDeck.setDescription(pitchDeck.getDescription());
        existingDeck.setIsPublic(pitchDeck.getIsPublic());
        
        return pitchDeckRepository.save(existingDeck);
    }

    @Transactional
    public void deletePitchDeck(Long id) {
        PitchDeck pitchDeck = getPitchDeckById(id);
        
        // Delete file from disk
        try {
            Path filePath = Paths.get(pitchDeck.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error but continue with database deletion
            System.err.println("Failed to delete file: " + e.getMessage());
        }
        
        // Delete from database
        pitchDeckRepository.delete(pitchDeck);
    }
} 