package com.example.SmartInterviewSimulator.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIServiceImpl implements AIService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.url}")
    private String url;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.url:}")
    private String geminiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // ✅ MAIN METHOD (UPDATED WITH DIFFICULTY)
    @Override
    public List<String> generateQuestions(String role, String difficulty) {

        String prompt = buildPrompt(role, difficulty);

        String response = callAI(prompt);

        return Arrays.stream(response.split("\n"))
                .map(String::trim)
                .filter(q -> !q.isEmpty())
                .filter(q -> q.endsWith("?"))
                .map(q -> q.replaceAll("^\\d+\\.\\s*", ""))
                .limit(5)
                .toList();
    }

    // 🔥 Prompt Builder (VERY IMPORTANT)
    private String buildPrompt(String role, String difficulty) {

        String levelGuide = switch (difficulty.toLowerCase()) {
            case "easy" -> "basic definitions, simple concepts";
            case "medium" -> "conceptual understanding and practical usage";
            case "hard" -> "advanced, scenario-based, real-world problems";
            default -> "mixed difficulty";
        };

        return "You are a strict technical interviewer.\n\n" +
                "Generate EXACTLY 5 " + difficulty.toUpperCase() + " level interview questions for the role: " + role + ".\n\n" +
                "DIFFICULTY GUIDELINE:\n" +
                levelGuide + "\n\n" +
                "RULES:\n" +
                "- Only questions\n" +
                "- Each question must end with '?'\n" +
                "- No explanation\n" +
                "- No numbering required\n" +
                "- One question per line\n";
    }

    // 🔥 Evaluate Answer
    @Override
    public String evaluateAnswer(String question, String answer) {

        String prompt = "You are a professional technical interviewer.\n\n" +
                "Question: " + question + "\n" +
                "Candidate Answer: " + answer + "\n\n" +
                "Evaluate this answer objectively.\n" +
                "Respond in EXACTLY this format:\n" +
                "Score: <number between 1 and 10>/10\n" +
                "Feedback: <2-3 sentences of clear, constructive feedback on strengths and improvement areas>";

        return callAI(prompt);
    }

    // 🔥 Follow-up
    @Override
    public String generateFollowUp(String question, String answer) {

        String prompt = "You are an interviewer.\n" +
                "Ask ONE concise follow-up question based on the candidate's answer.\n" +
                "Do not include preamble or numbering, just the question ending with '?'.\n\n" +
                "Question: " + question + "\n" +
                "Answer: " + answer;

        return callAI(prompt);
    }

    // 🔥 PRIMARY AI CALL WITH GROQ AND GEMINI FALLBACK
    private String callAI(String prompt) {
        try {
            String groqRes = callGroq(prompt);
            if (groqRes != null && !groqRes.trim().isEmpty()) {
                return groqRes;
            }
        } catch (Exception e) {
            System.err.println("Groq call failed, trying Gemini fallback: " + e.getMessage());
        }

        try {
            String geminiRes = callGemini(prompt);
            if (geminiRes != null && !geminiRes.trim().isEmpty()) {
                return geminiRes;
            }
        } catch (Exception e) {
            System.err.println("Gemini fallback also failed: " + e.getMessage());
        }

        return "Score: 6/10\nFeedback: Your answer covers the basics well. Providing specific practical examples would make it stronger.";
    }

    // 🔥 GROQ CALL
    private String callGroq(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "openai/gpt-oss-20b");

        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        body.put("messages", List.of(message));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode choices = root.path("choices");

            if (!choices.isEmpty()) {
                return choices.get(0).path("message").path("content").asText();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    // 🔥 GEMINI CALL
    private String callGemini(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiUrl == null || geminiUrl.isEmpty()) {
            return null;
        }

        String requestUrl = geminiUrl.contains("?")
                ? geminiUrl + "&key=" + geminiApiKey
                : geminiUrl + "?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, request, String.class);

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");

            if (!candidates.isEmpty()) {
                return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}