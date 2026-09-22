package com.example.SmartInterviewSimulator.dto;

public class HistoryDTO {

    private String question;
    private String answer;
    private String feedback;
    private int score;

    // ✅ Default constructor (IMPORTANT)
    public HistoryDTO() {}

    // ✅ 3-param constructor for backward compatibility
    public HistoryDTO(String question, String answer, String feedback) {
        this.question = question;
        this.answer = answer;
        this.feedback = feedback;
        this.score = 0;
    }

    // ✅ Parameterized constructor with score
    public HistoryDTO(String question, String answer, String feedback, int score) {
        this.question = question;
        this.answer = answer;
        this.feedback = feedback;
        this.score = score;
    }

    // ✅ Getters
    public String getQuestion() {
        return question;
    }

    public String getAnswer() {
        return answer;
    }

    public String getFeedback() {
        return feedback;
    }

    public int getScore() {
        return score;
    }

    // ✅ Setters (IMPORTANT)
    public void setQuestion(String question) {
        this.question = question;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public void setScore(int score) {
        this.score = score;
    }
}