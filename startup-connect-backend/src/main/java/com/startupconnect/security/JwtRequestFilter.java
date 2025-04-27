package com.startupconnect.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String requestPath = request.getRequestURI();
        final String method = request.getMethod();
        final String authorizationHeader = request.getHeader("Authorization");
        
        System.out.println("\n==== REQUEST INFO ====");
        System.out.println("Path: " + requestPath);
        System.out.println("Method: " + method);
        System.out.println("Authorization Header: " + (authorizationHeader != null ? "Present" : "Missing"));

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtTokenUtil.extractUsername(jwt);
                System.out.println("Extracted username from JWT: " + username);
                
                // Debug: Print all JWT claims
                System.out.println("JWT Claims: " + jwtTokenUtil.extractAllClaims(jwt));
            } catch (Exception e) {
                System.err.println("Error extracting username from JWT: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("No valid Authorization header found");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                System.out.println("Loaded UserDetails: " + userDetails.getUsername());
                System.out.println("UserDetails authorities: " + userDetails.getAuthorities());
                
                if (jwtTokenUtil.validateToken(jwt, userDetails)) {
                    System.out.println("JWT token validated successfully");
                    java.util.List<String> roles = jwtTokenUtil.extractRoles(jwt);
                    System.out.println("Extracted roles from JWT: " + roles);
                    
                    java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();
                    for (String role : roles) {
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(role));
                    }
                    System.out.println("Created authorities: " + authorities);
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authentication set in SecurityContext");
                } else {
                    System.out.println("JWT token validation failed");
                }
            } catch (Exception e) {
                System.err.println("Error during authentication: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            if (username == null) {
                System.out.println("Username is null, skipping authentication");
            } else {
                System.out.println("Authentication already exists in SecurityContext");
            }
        }
        
        // For admin endpoints, log special debug info
        if (requestPath.contains("/api/admin/")) {
            System.out.println("\n==== ADMIN ENDPOINT ACCESS ====");
            System.out.println("Current authentication: " + SecurityContextHolder.getContext().getAuthentication());
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                System.out.println("Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
            }
        }
        
        System.out.println("==== END REQUEST INFO ====\n");
        chain.doFilter(request, response);
    }
} 