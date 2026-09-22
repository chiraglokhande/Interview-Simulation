package com.example.SmartInterviewSimulator.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity

public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("question")
    @Column(length = 2000)
    private String questionText;
    
    private String difficulty;

    public String getDifficulty() {
		return difficulty;
	}

	public void setDifficulty(String difficulty) {
		this.difficulty = difficulty;
	}

	@ManyToOne
    private Interview interview;
    
    private String role; 

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public Question(Long id, String questionText, Interview interview) {
		super();
		this.id = id;
		this.questionText = questionText;
		this.interview = interview;
	}

	public Question() {
		// TODO Auto-generated constructor stub
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getQuestionText() {
		return questionText;
	}

	public void setQuestionText(String questionText) {
		this.questionText = questionText;
	}

	public Interview getInterview() {
		return interview;
	}

	public void setInterview(Interview interview) {
		this.interview = interview;
	}
    
	
    
}