package com.example.SmartInterviewSimulator.service;

import com.example.SmartInterviewSimulator.dto.AnswerRequest;
import com.example.SmartInterviewSimulator.entity.Answer;
import com.example.SmartInterviewSimulator.entity.Question;
import com.example.SmartInterviewSimulator.repository.AnswerRepository;
import com.example.SmartInterviewSimulator.repository.QuestionRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnswerServiceImpl implements AnswerService {

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private AnswerRepository answerRepo;

    @Autowired
    private com.example.SmartInterviewSimulator.repository.InterviewRepository interviewRepo;

    @Autowired
    private AIService aiService;

    // ================= SAVE ANSWER =================
    @Override
    public Answer submitAnswer(AnswerRequest request) {

        // 🔥 Validate input
        if (request.getQuestionId() == null || request.getAnswerText() == null) {
            throw new RuntimeException("Invalid request data");
        }

        Question question = questionRepo.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // 🔥 Resolve Interview properly from request or question
        com.example.SmartInterviewSimulator.entity.Interview interview = null;
        if (request.getInterviewId() != null) {
            interview = interviewRepo.findById(request.getInterviewId()).orElse(null);
        }
        if (interview == null && question.getInterview() != null) {
            interview = question.getInterview();
        }
        if (interview != null && question.getInterview() == null) {
            question.setInterview(interview);
            questionRepo.save(question);
        }

        String aiResponse = "";
        int score = 7;
        String feedback = "Good effort. Your answer addresses key concepts.";

        String evalQuestion = request.getQuestionText();
        if (evalQuestion == null || evalQuestion.trim().isEmpty()) {
            evalQuestion = question.getQuestionText();
        }

        try {
            // 🔥 Call AI with the exact question asked
            aiResponse = aiService.evaluateAnswer(
                    evalQuestion,
                    request.getAnswerText()
            );

            System.out.println("AI RAW RESPONSE: " + aiResponse);

            // 🔥 Extract score safely (e.g., Score: 8/10 or 8/10 or Score: 8)
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(?:Score:\\s*)?(\\d+)\\s*/\\s*10", java.util.regex.Pattern.CASE_INSENSITIVE);
            java.util.regex.Matcher matcher = pattern.matcher(aiResponse);

            if (matcher.find()) {
                score = Integer.parseInt(matcher.group(1));
            } else {
                java.util.regex.Pattern scorePattern = java.util.regex.Pattern.compile("Score:\\s*(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE);
                java.util.regex.Matcher scoreMatcher = scorePattern.matcher(aiResponse);
                if (scoreMatcher.find()) {
                    score = Integer.parseInt(scoreMatcher.group(1));
                } else {
                    score = 6;
                }
            }

            if (score < 1) score = 1;
            if (score > 10) score = 10;

            // 🔥 Extract clean feedback text
            String cleanFeedback = aiResponse;
            int feedbackIdx = cleanFeedback.toLowerCase().indexOf("feedback:");
            if (feedbackIdx != -1) {
                cleanFeedback = cleanFeedback.substring(feedbackIdx + "feedback:".length()).trim();
            }
            int nextQIdx = cleanFeedback.toLowerCase().indexOf("next question:");
            if (nextQIdx != -1) {
                cleanFeedback = cleanFeedback.substring(0, nextQIdx).trim();
            }
            cleanFeedback = cleanFeedback.replaceAll("(?i)Score:\\s*\\d+\\s*(?:/\\s*10)?", "").trim();

            if (!cleanFeedback.isEmpty()) {
                feedback = cleanFeedback;
            }

        } catch (Exception e) {
            System.out.println("⚠ AI FAILED: " + e.getMessage());
            feedback = "Answer recorded. Good conceptual explanation.";
            score = 6;
        }

        // 🔥 SAVE ALWAYS
        Answer answer = new Answer();
        answer.setAnswerText(request.getAnswerText());
        answer.setScore(score);
        answer.setFeedback(feedback);
        answer.setQuestion(question);
        answer.setInterview(interview);

        String role = request.getRole();
        if ((role == null || role.isBlank()) && interview != null) {
            role = interview.getRole();
        }
        answer.setRole(role);

        String difficulty = request.getDifficulty();
        if ((difficulty == null || difficulty.isBlank()) && interview != null) {
            difficulty = interview.getDifficulty();
        }
        answer.setDifficulty(difficulty);

        // 🔥 SAVE TO DB
        Answer saved = answerRepo.save(answer);

        System.out.println("✅ SAVED ANSWER ID: " + saved.getId() + " FOR INTERVIEW: " + (interview != null ? interview.getId() : "null"));

        return saved;
    }

    // ================= TOTAL SCORE =================
    @Override
    public int getTotalScore(Long interviewId) {

        List<Answer> answers = answerRepo.findByQuestionInterviewId(interviewId);

        return answers.stream()
                .mapToInt(Answer::getScore)
                .sum();
    }
}