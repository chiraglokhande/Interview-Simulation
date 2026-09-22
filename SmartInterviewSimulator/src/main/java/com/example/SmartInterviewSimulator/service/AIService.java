package com.example.SmartInterviewSimulator.service;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public interface AIService {

    // 🎯 Generate questions based on role + difficulty
    List<String> generateQuestions(String role, String difficulty);

    // 🤖 Evaluate answer + next question
    String evaluateAnswer(String question, String answer);

    // 🔁 Optional follow-up
    String generateFollowUp(String question, String answer);
}