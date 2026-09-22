package com.example.SmartInterviewSimulator.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.example.SmartInterviewSimulator.entity.Resume;

public interface ResumeService {

    Resume uploadResume(MultipartFile file, Long userId);

    String extractText(MultipartFile file);

    List<Resume> getUserResumes(Long userId);

}