package com.example.SmartInterviewSimulator.controller;

import java.util.Map; // ✅ IMPORTANT

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SmartInterviewSimulator.dto.AnswerRequest;
import com.example.SmartInterviewSimulator.entity.Answer;
import com.example.SmartInterviewSimulator.service.AIServiceImpl;
import com.example.SmartInterviewSimulator.service.AnswerServiceImpl;

@RestController
@RequestMapping("/answer")
@CrossOrigin("*")
public class AnswerController {

    @Autowired
    private AnswerServiceImpl answerService;
    
    @Autowired
    private AIServiceImpl aiService;

    // ================= SUBMIT ANSWER =================
    @PostMapping("/submit")
    public ResponseEntity<?> submit(@RequestBody AnswerRequest req) {

        Answer saved = answerService.submitAnswer(req);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "id", saved.getId(),
            "feedback", saved.getFeedback(),
            "score", saved.getScore()
        ));
    }
    @PostMapping("/evaluate")
    public String evaluate(@RequestBody Map<String, String> req) {

        String question = req.get("question");
        String answer = req.get("answer");

        System.out.println("🤖 Evaluating...");
        System.out.println("Q: " + question);
        System.out.println("A: " + answer);

        return aiService.evaluateAnswer(question, answer);
    }
    // ================= TOTAL SCORE =================
    @GetMapping("/score/{interviewId}")
    public int getScore(@PathVariable Long interviewId) {
        return answerService.getTotalScore(interviewId);
    }
}