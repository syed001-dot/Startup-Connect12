package com.startupconnect.controller;

import com.startupconnect.model.User;
import com.startupconnect.service.UserService;
import com.startupconnect.model.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @Autowired
    private UserService userService;

    // Get user by email - only allow startup to find investors and vice versa
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            String decodedEmail = java.net.URLDecoder.decode(email, java.nio.charset.StandardCharsets.UTF_8);
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(authentication.getName());
            User targetUser = userService.findByEmail(decodedEmail);
            if (currentUser == null || targetUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(java.util.Collections.singletonMap("error", "User not found"));
            }
            if (currentUser.getRole() == targetUser.getRole()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(java.util.Collections.singletonMap("error", "You can only message users of the opposite type."));
            }
            return ResponseEntity.ok(targetUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Collections.singletonMap("error", "User not found: " + e.getMessage()));
        }
    }
}
