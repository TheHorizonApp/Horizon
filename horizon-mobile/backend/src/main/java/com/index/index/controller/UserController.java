package com.index.index.controller;

import com.index.index.model.User;
import com.index.index.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.util.Base64;

@RestController
@RequestMapping("/auth")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            logger.info("Registration attempted with an email already in use: {}", user.getEmail());
            return ResponseEntity.badRequest().body("{\"message\": \"Email already in use\"}");
        }
        userRepository.save(user);
        logger.info("User registered successfully: {}", user.getEmail());
        return ResponseEntity.ok()
                .body("{\"message\": \"User registered successfully\", \"email\": \"" + user.getEmail() + "\"}");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginUser) {
        User user = userRepository.findByEmail(loginUser.getEmail());
        if (user != null && user.getPassword().equals(loginUser.getPassword())) {
            logger.info("Login successful for user: {}", loginUser.getEmail());

            if (user.getSecretKey() == null) {
                // Generate a secure key
                SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
                String encodedKey = Base64.getEncoder().encodeToString(secretKey.getEncoded());

                // Save the encoded key in the user's record
                user.setSecretKey(encodedKey);
                userRepository.save(user);
            }

            long currentTimeMillis = System.currentTimeMillis();
            SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(user.getSecretKey()));
            String token = Jwts.builder()
                    .setSubject(user.getEmail())
                    .setIssuedAt(new Date(currentTimeMillis))
                    .setExpiration(new Date(currentTimeMillis + 3600000))
                    .signWith(key, SignatureAlgorithm.HS512)
                    .compact();

            return ResponseEntity.ok().body("{\"token\": \"" + token + "\", \"secretKey\": \"" + user.getSecretKey()
                    + "\", \"email\": \"" + user.getEmail() + "\"}");
        } else {
            logger.warn("Invalid login attempt for email: {}", loginUser.getEmail());
            return ResponseEntity.badRequest().body("{\"message\": \"Invalid email or password\"}");
        }
    }
}