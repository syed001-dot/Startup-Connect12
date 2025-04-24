package com.startupconnect.controller;

import com.startupconnect.dto.MessageDto;
import com.startupconnect.model.Message;
import com.startupconnect.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @Autowired
    private com.startupconnect.service.UserService userService;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody MessageDto dto) {
        Message msg = messageService.sendMessage(dto.getSenderId(), dto.getReceiverId(), dto.getContent());
        return ResponseEntity.ok(msg);
    }

    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(
            @RequestParam Long user1,
            @RequestParam Long user2
    ) {
        try {
            List<Message> messages = messageService.getConversation(user1, user2);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                                 .body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/conversation-users")
    public ResponseEntity<List<com.startupconnect.model.User>> getConversationUsers(@RequestParam Long userId) {
        List<com.startupconnect.model.User> users = messageService.getConversationUsers(userId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            com.startupconnect.model.User user = userService.getUserById(id);
            if (user == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                        .body(java.util.Collections.singletonMap("error", "User not found"));
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(java.util.Collections.singletonMap("error", "User not found: " + e.getMessage()));
        }
    }
}
