package com.example.SmartInterviewSimulator.dto;

public class InterviewRequest {

    private String role;
    private String difficulty;

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}