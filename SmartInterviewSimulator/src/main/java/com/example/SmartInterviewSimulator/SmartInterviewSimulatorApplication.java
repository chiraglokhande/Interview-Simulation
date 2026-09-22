package com.example.SmartInterviewSimulator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartInterviewSimulatorApplication {

	public static void main(String[] args) {
		String springDbUrl = System.getenv("SPRING_DATASOURCE_URL");
		String dbUrl = System.getenv("DATABASE_URL");
		String mysqlUrl = System.getenv("MYSQL_URL");
		System.out.println("==================================================");
		System.out.println(">>> CHECKING DATABASE CONFIGURATION:");
		System.out.println(">>> SPRING_DATASOURCE_URL: " + (springDbUrl != null ? springDbUrl : "NOT FOUND (Falling back to localhost:3306!)"));
		System.out.println(">>> DATABASE_URL: " + (dbUrl != null ? dbUrl : "NOT FOUND"));
		System.out.println(">>> MYSQL_URL: " + (mysqlUrl != null ? mysqlUrl : "NOT FOUND"));
		System.out.println("==================================================");

		SpringApplication.run(SmartInterviewSimulatorApplication.class, args);
	}

}
