package com.example.SmartInterviewSimulator.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.SmartInterviewSimulator.entity.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
}