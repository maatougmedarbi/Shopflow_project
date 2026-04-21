package com.shopflow.service;

import com.shopflow.model.User;
import com.shopflow.model.Role;
import com.shopflow.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        user.setRole(Role.CUSTOMER);
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    public User getCurrentUser() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(user.getId()).orElseThrow();
    }

    public User updateUser(User updated) {
        User user = getCurrentUser();

        user.setFirstName(updated.getFirstName());
        user.setLastName(updated.getLastName());

        return userRepository.save(user);
    }
}