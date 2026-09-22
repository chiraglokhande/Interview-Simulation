package com.example.SmartInterviewSimulator.dto;

public class AnswerRequest {

    /* =====================================
       REQUIRED FIELDS
    ===================================== */
    private Long interviewId;
    private Long questionId;

    private String answerText;

    /* =====================================
       EXTRA FIELDS
    ===================================== */
    private String role;
    private String difficulty;

    /* =====================================
       CONSTRUCTORS
    ===================================== */
    public AnswerRequest() {
    }

    public AnswerRequest(
        Long interviewId,
        Long questionId,
        String answerText,
        String role,
        String difficulty
    ) {
        this.interviewId = interviewId;
        this.questionId = questionId;
        this.answerText = answerText;
        this.role = role;
        this.difficulty = difficulty;
    }

    /* =====================================
       GETTERS / SETTERS
    ===================================== */

    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(
        Long interviewId
    ) {
        this.interviewId =
            interviewId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(
        Long questionId
    ) {
        this.questionId =
            questionId;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(
        String answerText
    ) {
        this.answerText =
            answerText;
    }

    public String getRole() {
        return role;
    }

    public void setRole(
        String role
    ) {
        this.role = role;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(
        String difficulty
    ) {
        this.difficulty =
            difficulty;
    }

}