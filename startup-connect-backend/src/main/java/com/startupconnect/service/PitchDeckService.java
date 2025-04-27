package com.startupconnect.service;

import com.startupconnect.model.PitchDeck;
import com.startupconnect.model.StartupProfile;
import com.startupconnect.repository.PitchDeckRepository;
import com.startupconnect.repository.StartupProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class PitchDeckService {

    @Autowired
    private PitchDeckRepository pitchDeckRepository;

    @Autowired
    private StartupProfileRepository startupProfileRepository;

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
            
            // Check if file type is allowed (PDF, PPT, PPTX)
            boolean isAllowedType = contentType.equals("application/pdf") || 
                                   contentType.equals("application/vnd.ms-powerpoint") || 
                                   contentType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation");
            
            if (!isAllowedType) {
                throw new IllegalArgumentException("File type not allowed. Please upload PDF, PPT, or PPTX files only.");
            }

            // Get startup profile
            StartupProfile startup = startupProfileRepository.findById(startupId)
                    .orElseThrow(() -> new RuntimeException("Startup not found with id: " + startupId));

            // Create pitch deck entity
            PitchDeck pitchDeck = new PitchDeck();
            pitchDeck.setStartup(startup);
            pitchDeck.setTitle(title);
            pitchDeck.setDescription(description);
            pitchDeck.setFileName(file.getOriginalFilename());
            pitchDeck.setFileSize(file.getSize());
            pitchDeck.setFileType(file.getContentType());
            pitchDeck.setFileContent(file.getBytes());
            pitchDeck.setIsPublic(isPublic != null ? isPublic : false);

            // Save to database
            return pitchDeckRepository.save(pitchDeck);
        } catch (IOException e) {
            throw new RuntimeException("Failed to process file: " + e.getMessage());
        } catch (Exception e) {
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
        pitchDeckRepository.delete(pitchDeck);
    }
} 