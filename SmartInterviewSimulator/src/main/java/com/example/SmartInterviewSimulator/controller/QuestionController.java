package com.example.SmartInterviewSimulator.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.SmartInterviewSimulator.dto.HistoryDTO;
import com.example.SmartInterviewSimulator.dto.InterviewRequest;
import com.example.SmartInterviewSimulator.entity.Interview;
import com.example.SmartInterviewSimulator.entity.Question;
import com.example.SmartInterviewSimulator.repository.QuestionRepository;
import com.example.SmartInterviewSimulator.security.JwtUtil;
import com.example.SmartInterviewSimulator.service.AIServiceImpl;
import com.example.SmartInterviewSimulator.service.InterviewServiceImpl;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/question")
@CrossOrigin(origins = "http://localhost:4200") // ✅ safer than "*"
public class QuestionController {

    @Autowired
    private AIServiceImpl aiService;

    @Autowired
    private InterviewServiceImpl interviewService;

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/start")
    public Interview startInterview(
            @RequestBody InterviewRequest req,
            HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        return interviewService.startInterview(
                req.getRole(),
                req.getDifficulty(),
                email
        );
    } 

    // ================= GET QUESTIONS BY INTERVIEW =================
    @GetMapping("/interview/{interviewId}")
    public List<Question> getQuestionsByInterview(@PathVariable Long interviewId) {
        System.out.println("📥 FETCH QUESTIONS FOR INTERVIEW: " + interviewId);
        return interviewService.getQuestions(interviewId);
    }

    // ================= GET QUESTIONS =================
    @GetMapping("/{role}/questions")
    public List<Question> getQuestions(@PathVariable String role,
                                       @RequestParam String difficulty) {

        System.out.println("📥 FETCH QUESTIONS: " + role + " | " + difficulty);

        return questionRepo.findByRoleAndDifficulty(role, difficulty);
    }

    // ================= FOLLOW-UP QUESTION =================
    @PostMapping("/followup")
    public String followUp(@RequestBody Map<String, String> req) {

        String question = req.get("question");
        String answer = req.get("answer");

        System.out.println("🤖 FOLLOW-UP for Q: " + question);

        return aiService.generateFollowUp(question, answer);
    }
    
    @GetMapping("/history/roles")
    public List<String> getRoles(
        HttpServletRequest request
    ) {

        String auth =
          request.getHeader("Authorization");

        String token = auth.substring(7);

        String email =
          jwtUtil.extractEmail(token);

        return interviewService.getRolesByEmail(email);
    }

    @GetMapping("/history/{role}")
    public List<HistoryDTO> getHistory(
        @PathVariable String role,
        HttpServletRequest request
    ) {

        String auth =
          request.getHeader("Authorization");

        String token = auth.substring(7);

        String email =
          jwtUtil.extractEmail(token);

        return interviewService.getHistoryByEmail(
          role,
          email
        );
    }
}