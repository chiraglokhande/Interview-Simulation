package com.example.SmartInterviewSimulator.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.SmartInterviewSimulator.entity.Resume;
import com.example.SmartInterviewSimulator.repository.ResumeRepository;
import com.example.SmartInterviewSimulator.service.ResumeService;

@RestController
@RequestMapping("/resume")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private ResumeRepository resumeRepository;

    // ==========================
    // Upload Resume
    // ==========================
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {

        try {

            Resume resume = resumeService.uploadResume(file, userId);

            return ResponseEntity.ok(resume);

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(e.getMessage());

        }
    }

    // ==========================
    // Get Resume By Id
    // ==========================
    @GetMapping("/{resumeId}")
    public ResponseEntity<?> getResume(@PathVariable Long resumeId) {

        return resumeRepository.findById(resumeId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());

    }

    // ==========================
    // Get All User Resumes
    // ==========================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resume>> getUserResumes(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                resumeService.getUserResumes(userId)
        );

    }

    // ==========================
    // Delete Resume
    // ==========================
    @DeleteMapping("/{resumeId}")
    public ResponseEntity<?> deleteResume(
            @PathVariable Long resumeId) {

        if (!resumeRepository.existsById(resumeId)) {
            return ResponseEntity.badRequest().body("Resume not found");
        }

        resumeRepository.deleteById(resumeId);

        return ResponseEntity.ok("Resume deleted successfully");
    }

}