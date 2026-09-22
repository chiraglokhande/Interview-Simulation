package com.example.SmartInterviewSimulator.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity 
public class Interview {

    @Id @GeneratedValue
    private Long id;

    private String role;
    private LocalDateTime startTime;
    
    private String difficulty;

    public String getDifficulty() {
		return difficulty;
	}

	public void setDifficulty(String difficulty) {
		this.difficulty = difficulty;
	}

	@ManyToOne
    private User user;

	public Interview() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Interview(Long id, String role, LocalDateTime startTime, User user) {
		super();
		this.id = id;
		this.role = role;
		this.startTime = startTime;
		this.user = user;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public LocalDateTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalDateTime startTime) {
		this.startTime = startTime;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
    
    
    
}