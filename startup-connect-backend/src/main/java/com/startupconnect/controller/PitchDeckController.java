package com.startupconnect.controller;

import com.startupconnect.model.PitchDeck;
import com.startupconnect.model.User;
import com.startupconnect.service.PitchDeckService;
import com.startupconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/pitchdecks")
@CrossOrigin(origins = "http://localhost:3000")
public class PitchDeckController {

    @Autowired
    private PitchDeckService pitchDeckService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<PitchDeck>> getAllPitchDecks() {
        return ResponseEntity.ok(pitchDeckService.getAllPitchDecks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PitchDeck> getPitchDeckById(@PathVariable Long id) {
        return ResponseEntity.ok(pitchDeckService.getPitchDeckById(id));
    }

    @GetMapping("/startup/{startupId}")
    public ResponseEntity<List<PitchDeck>> getPitchDecksByStartup(@PathVariable Long startupId) {
        return ResponseEntity.ok(pitchDeckService.getPitchDecksByStartup(startupId));
    }

    @GetMapping("/startup/{startupId}/public")
    public ResponseEntity<List<PitchDeck>> getPublicPitchDecksByStartup(@PathVariable Long startupId) {
        return ResponseEntity.ok(pitchDeckService.getPublicPitchDecksByStartup(startupId));
    }

    @PostMapping("/upload/{startupId}")
    public ResponseEntity<?> uploadPitchDeck(
            @PathVariable Long startupId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "isPublic", required = false) Boolean isPublic) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(authentication.getName());
            
            // Verify that the user owns the startup
            if (!currentUser.getStartupProfile().getId().equals(startupId)) {
                return ResponseEntity.badRequest().body("You can only upload pitch decks for your own startup");
            }

            PitchDeck pitchDeck = pitchDeckService.uploadPitchDeck(startupId, file, title, description, isPublic);
            return ResponseEntity.ok(pitchDeck);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePitchDeck(@PathVariable Long id, @RequestBody PitchDeck pitchDeck) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(authentication.getName());
            
            // Get existing pitch deck
            PitchDeck existingDeck = pitchDeckService.getPitchDeckById(id);
            if (existingDeck == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Verify that the user owns the pitch deck
            if (!existingDeck.getStartup().getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.badRequest().body("You can only update your own pitch decks");
            }
            
            pitchDeck.setId(id);
            return ResponseEntity.ok(pitchDeckService.updatePitchDeck(pitchDeck));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePitchDeck(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(authentication.getName());
            
            // Get existing pitch deck
            PitchDeck existingDeck = pitchDeckService.getPitchDeckById(id);
            if (existingDeck == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Verify that the user owns the pitch deck
            if (!existingDeck.getStartup().getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.badRequest().body("You can only delete your own pitch decks");
            }
            
            pitchDeckService.deletePitchDeck(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<ByteArrayResource> downloadPitchDeck(@PathVariable Long id) {
        try {
            PitchDeck pitchDeck = pitchDeckService.getPitchDeckById(id);
            ByteArrayResource resource = new ByteArrayResource(pitchDeck.getFileContent());
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pitchDeck.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/public/{id}/file")
    public ResponseEntity<ByteArrayResource> getPublicPitchDeckFile(@PathVariable Long id) {
        PitchDeck pitchDeck = pitchDeckService.getPitchDeckById(id);
        if (pitchDeck == null || !Boolean.TRUE.equals(pitchDeck.getIsPublic())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        ByteArrayResource resource = new ByteArrayResource(pitchDeck.getFileContent());
        boolean isPdf = "application/pdf".equals(pitchDeck.getFileType());
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(pitchDeck.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, (isPdf ? "inline" : "attachment") + "; filename=\"" + pitchDeck.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/preview/{id}")
    public ResponseEntity<ByteArrayResource> previewPitchDeck(@PathVariable Long id) {
        try {
            PitchDeck pitchDeck = pitchDeckService.getPitchDeckById(id);
            ByteArrayResource resource = new ByteArrayResource(pitchDeck.getFileContent());
            
            // For PDF files, we'll return inline content disposition
            if (pitchDeck.getFileType().equals("application/pdf")) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(pitchDeck.getFileType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + pitchDeck.getFileName() + "\"")
                        .body(resource);
            } else {
                // For other files, we'll return them as attachments
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType("application/octet-stream"))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pitchDeck.getFileName() + "\"")
                        .body(resource);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 