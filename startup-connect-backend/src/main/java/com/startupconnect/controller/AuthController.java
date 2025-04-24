package com.startupconnect.controller;

import com.startupconnect.model.User;
import com.startupconnect.model.StartupProfile;
import com.startupconnect.model.InvestorProfile;
import com.startupconnect.model.UserRole;
import com.startupconnect.security.JwtTokenUtil;
import com.startupconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, Object> registrationData) {
        try {
            // Extract basic user info
            User user = new User();
            user.setEmail((String) registrationData.get("email"));
            user.setPassword((String) registrationData.get("password"));
            user.setFullName((String) registrationData.get("fullName"));
            user.setRole(UserRole.valueOf((String) registrationData.get("role")));

            // Register the user
            User registeredUser = userService.registerUser(user);

            // Create profile based on user type
            if (user.getRole() == UserRole.STARTUP) {
                StartupProfile startupProfile = new StartupProfile();
                startupProfile.setUser(registeredUser);
                startupProfile.setStartupName((String) registrationData.get("startupName"));
                startupProfile.setDescription((String) registrationData.get("startupDescription"));
                startupProfile.setIndustry((String) registrationData.get("industry"));
                startupProfile.setFundingStage((String) registrationData.get("fundingStage"));
                userService.saveStartupProfile(startupProfile);
                
                // Update user with profile
                registeredUser.setStartupProfile(startupProfile);
                userService.updateUser(registeredUser);
            } else if (user.getRole() == UserRole.INVESTOR) {
                InvestorProfile investorProfile = new InvestorProfile();
                investorProfile.setUser(registeredUser);
                investorProfile.setCompanyName((String) registrationData.get("companyName"));
                investorProfile.setSector((String) registrationData.get("sector"));
                investorProfile.setInvestmentRangeMin(Double.parseDouble(registrationData.get("investmentRangeMin").toString()));
                investorProfile.setInvestmentRangeMax(Double.parseDouble(registrationData.get("investmentRangeMax").toString()));
                investorProfile.setLocation((String) registrationData.get("location"));
                investorProfile.setInvestmentFocus((String) registrationData.get("investmentFocus"));
                investorProfile.setDescription((String) registrationData.get("description"));
                investorProfile.setActiveInvestmentsCount(0);
                userService.saveInvestorProfile(investorProfile);
                
                // Update user with profile
                registeredUser.setInvestorProfile(investorProfile);
                userService.updateUser(registeredUser);
            }

            // Generate token for immediate login
            UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(registeredUser.getEmail())
                .password(registeredUser.getPassword())
                .roles(registeredUser.getRole().name())
                .build();
            String token = jwtTokenUtil.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", registeredUser);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.get("email"), loginRequest.get("password"))
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtTokenUtil.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userService.findByEmail(userDetails.getUsername()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        // Only ADMIN can access this
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userService.findByEmail(userDetails.getUsername());

            // Check if user is ADMIN or requesting their own data
            if (currentUser.getRole() == UserRole.ADMIN || currentUser.getId().equals(id)) {
                User user = userService.getUserById(id);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> passwordData) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userService.findByEmail(userDetails.getUsername());

            // Check if user is ADMIN or updating their own password
            if (currentUser.getRole() == UserRole.ADMIN || currentUser.getId().equals(id)) {
                User user = userService.getUserById(id);
                user.setPassword(passwordEncoder.encode(passwordData.get("password")));
                userService.updateUser(user);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 