package com.example.SmartInterviewSimulator.service;


import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.SmartInterviewSimulator.entity.Resume;
import com.example.SmartInterviewSimulator.entity.User;
import com.example.SmartInterviewSimulator.repository.ResumeRepository;
import com.example.SmartInterviewSimulator.repository.UserRepository;

@Service
public class ResumeServiceImpl implements ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Resume uploadResume(MultipartFile file, Long userId) {

        try {

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String extractedText = extractText(file);

            Resume resume = new Resume();
            resume.setFileName(file.getOriginalFilename());
            resume.setExtractedText(extractedText);
            resume.setUploadedAt(LocalDateTime.now());
            resume.setUser(user);

            return resumeRepository.save(resume);

        } catch (Exception e) {
            throw new RuntimeException("Resume upload failed : " + e.getMessage());
        }
    }

    @Override
    public String extractText(MultipartFile file) {

        try {

            PDDocument document = Loader.loadPDF(file.getBytes());

            PDFTextStripper stripper = new PDFTextStripper();

            String text = stripper.getText(document);

            document.close();

            return text;

        } catch (IOException e) {
            throw new RuntimeException("Unable to read PDF");
        }
    }

    @Override
    public List<Resume> getUserResumes(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return resumeRepository.findByUser(user);
    }

}