package com.example.SmartInterviewSimulator.service;

import com.example.SmartInterviewSimulator.dto.HistoryDTO;
import com.example.SmartInterviewSimulator.entity.Interview;
import com.example.SmartInterviewSimulator.entity.Question;
import com.example.SmartInterviewSimulator.entity.User;
import com.example.SmartInterviewSimulator.repository.HistoryRepository;
import com.example.SmartInterviewSimulator.repository.InterviewRepository;
import com.example.SmartInterviewSimulator.repository.QuestionRepository;
import com.example.SmartInterviewSimulator.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewServiceImpl {

    @Autowired
    private InterviewRepository interviewRepo;

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private AIService aiService; // ✅ use interface (best practice)

    
    @Autowired
    private HistoryRepository repo;
    
    @Autowired
    private UserRepository userRepo;

    // 🔥 ✅ FINAL METHOD (ROLE + DIFFICULTY)
    public Interview startInterview(String role, String difficulty, String email) {

        // 🔐 Get logged-in user
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🧠 Create interview
        Interview interview = new Interview();
        interview.setRole(role);
        interview.setDifficulty(difficulty); // ✅ IMPORTANT
        interview.setStartTime(LocalDateTime.now());
        interview.setUser(user);

        interview = interviewRepo.save(interview);

        // 🤖 Generate questions based on difficulty
        List<String> questions = aiService.generateQuestions(role, difficulty);

        for (String q : questions) {
            if (q == null || q.trim().isEmpty()) continue;

            Question question = new Question();
            question.setQuestionText(q);
            question.setInterview(interview);
            question.setRole(role); // optional but useful
            question.setDifficulty(difficulty); // optional but powerful

            questionRepo.save(question);
        }

        return interview;
    }

    // 📋 Get questions by interview
    public List<Question> getQuestions(Long interviewId) {
        return questionRepo.findByInterviewId(interviewId);
    }
    
    
  public List<String> getRolesByEmail(
 String email
){
   return repo.getRolesByEmail(email);
}

public List<HistoryDTO> getHistoryByEmail(
 String role,
 String email
){
   return repo.getHistoryByEmail(role,email);
}
    
    public List<String> getRolesByUser(Long userId) {
        return repo.getRolesByUser(userId);
    }
    
}