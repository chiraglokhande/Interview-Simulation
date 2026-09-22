package com.example.SmartInterviewSimulator.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.SmartInterviewSimulator.entity.Role;
import com.example.SmartInterviewSimulator.repository.RoleRepository;

@Service
public class RoleService {

    @Autowired
    private RoleRepository repo;

    public List<Role> getAllRoles() {
        return repo.findAll();
    }

    public Role addRole(Role role) {
        return repo.save(role);
    }
}