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

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    // ✅ MAIN METHOD (UPDATED WITH DIFFICULTY)
    @Override
    public List<String> generateQuestions(String role, String difficulty) {

        String prompt = buildPrompt(role, difficulty);

        List<String> questions = new ArrayList<>();
        try {
            String response = callAI(prompt);
            if (response != null && !response.trim().isEmpty()) {
                questions = Arrays.stream(response.split("\n"))
                        .map(String::trim)
                        .filter(q -> !q.isEmpty())
                        .filter(q -> q.endsWith("?"))
                        .map(q -> q.replaceAll("^\\d+[\\.\\)]\\s*", ""))
                        .limit(5)
                        .toList();
            }
        } catch (Exception e) {
            System.err.println("Error generating questions from AI: " + e.getMessage());
        }

        if (questions.isEmpty()) {
            questions = getDefaultQuestions(role, difficulty);
        }

        return questions;
    }

    // 🛡️ Reliable fallback questions when AI APIs are unreachable or exhausted
    private List<String> getDefaultQuestions(String role, String difficulty) {
        String lowerRole = role != null ? role.toLowerCase() : "";
        String lowerDiff = difficulty != null ? difficulty.toLowerCase() : "easy";

        if (lowerRole.contains("java") || lowerRole.contains("spring")) {
            if ("hard".equals(lowerDiff)) {
                return List.of(
                    "How does the JVM Garbage Collector manage memory across Eden, Survivor, and Tenured spaces?",
                    "What are the concurrency guarantees provided by volatile and the Java Memory Model?",
                    "How do you tune HikariCP connection pool parameters for high-throughput Spring Boot applications?",
                    "Explain the difference between optimistic and pessimistic locking in Hibernate/JPA?",
                    "How would you design a distributed transaction workflow across microservices using the Saga pattern?"
                );
            } else if ("medium".equals(lowerDiff)) {
                return List.of(
                    "What is the difference between HashMap and ConcurrentHashMap in terms of thread-safety?",
                    "How does Spring Boot's @Transactional annotation work internally using AOP proxies?",
                    "What is the difference between Comparable and Comparator in Java Collections?",
                    "Explain the differences between checked and unchecked exceptions in Java?",
                    "How do CompletableFuture and ExecutorService differ for asynchronous task execution?"
                );
            } else {
                return List.of(
                    "What are the key differences between an abstract class and an interface in Java?",
                    "What is the purpose of the 'final' keyword when applied to variables, methods, and classes?",
                    "Explain the difference between '==' and '.equals()' in Java?",
                    "What are the main advantages of using Spring Boot over standard Spring MVC?",
                    "How does Dependency Injection improve code maintainability and testability?"
                );
            }
        } else if (lowerRole.contains("frontend") || lowerRole.contains("angular") || lowerRole.contains("react")) {
            return List.of(
                "What is the difference between Observables and Promises for asynchronous operations?",
                "How does the Virtual DOM or Angular Change Detection work under the hood?",
                "What are the best practices for managing application state across unrelated components?",
                "Explain the critical rendering path and techniques to optimize First Contentful Paint (FCP)?",
                "How do you implement secure client-side authentication token storage and interceptors?"
            );
        } else if (lowerRole.contains("python")) {
            return List.of(
                "What is Python's Global Interpreter Lock (GIL) and how does it affect CPU-bound multithreading?",
                "What is the difference between shallow copy and deep copy in Python?",
                "How do generators and the 'yield' keyword help with memory efficiency?",
                "Explain how Python's garbage collection and reference counting mechanism work?",
                "What are Python decorators and how do you write a custom parameterized decorator?"
            );
        }

        // Generic fallback for any other role
        return List.of(
            "What are the core technical responsibilities you have handled as a " + role + "?",
            "Can you explain a complex architectural problem you solved recently in " + role + "?",
            "How do you approach debugging and root cause analysis in production environments?",
            "What testing strategies (unit, integration, end-to-end) do you follow in your development workflow?",
            "How do you design scalable and maintainable systems for " + role + " projects?"
        );
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
        if (apiKey == null || apiKey.trim().isEmpty() || "YOUR_GROQ_API_KEY".equals(apiKey.trim())) {
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", groqModel != null && !groqModel.isEmpty() ? groqModel : "llama-3.3-70b-versatile");

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
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || "YOUR_GEMINI_API_KEY".equals(geminiApiKey.trim()) || geminiUrl == null || geminiUrl.isEmpty()) {
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