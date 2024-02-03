package com.index.index.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.index.index.model.Note;
import com.index.index.model.User;
import com.index.index.repository.NoteRepository;
import com.index.index.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")

public class NoteController {

    private static final Logger logger = LoggerFactory.getLogger(NoteController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NoteRepository noteRepository;

    @PostMapping("/saveNote")
    public ResponseEntity<?> saveNote(@RequestBody Note note, @RequestParam String email) {
        logger.info("Attempting to save note with title: '{}' for email: '{}'", note.getTitle(), email);

        User user = userRepository.findByEmail(email);
        if (user == null) {
            logger.warn("User not found for email: '{}'", email);
            return ResponseEntity.badRequest().body("{\"message\": \"User not found\"}");
        }

        try {
            if (note.getId() != null && !note.getId().isEmpty()) {
                Note existingNote = noteRepository.findById(note.getId()).orElse(null);
                if (existingNote == null || !existingNote.getEmail().equals(email)) {
                    return ResponseEntity.badRequest()
                            .body("{\"message\": \"Note not found or does not belong to the user\"}");
                }
                existingNote.setTitle(note.getTitle());
                existingNote.setContent(note.getContent());
                note = existingNote;
            } else {
                note.setEmail(email);
            }

            Note savedNote = noteRepository.save(note);
            if (note.getId() == null) {
                user.getNotes().add(savedNote);
                userRepository.save(user);
            }

            logger.info("Note successfully saved with ID: '{}'", savedNote.getId());
            return ResponseEntity.ok().body(savedNote);
        } catch (Exception e) {
            logger.error("Error saving note for email: '{}'", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"Error saving note\"}");
        }
    }

    @GetMapping("/getNotes")
    public ResponseEntity<?> getNotes(@RequestParam String email) {
        logger.info("Fetching notes for email: '{}'", email);
        User user = userRepository.findByEmail(email);
        if (user == null) {
            logger.warn("User not found for email: '{}'", email);
            return ResponseEntity.badRequest().body("{\"message\": \"User not found\"}");
        }
        logger.info("User found for email: '{}'. Proceeding to fetch notes.", email);
        try {
            List<Note> notes = noteRepository.findByEmail(email); 
            logger.info("Fetched {} notes for email: '{}'", notes.size(), email);
            notes.forEach(note -> logger.debug("Note details - Id: {}, Title: {}", note.getId(), note.getTitle()));
            return ResponseEntity.ok().body(notes);
        } catch (Exception e) {
            logger.error("Error fetching notes for email: '{}'", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Error fetching notes\"}");
        }
    }
    
    

}
