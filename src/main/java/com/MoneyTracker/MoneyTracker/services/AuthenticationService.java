package com.MoneyTracker.MoneyTracker.services;

import com.MoneyTracker.MoneyTracker.models.DTOs.UserLoginDTO;
import com.MoneyTracker.MoneyTracker.models.DTOs.UserSignupDTO;
import com.MoneyTracker.MoneyTracker.models.User;
import com.MoneyTracker.MoneyTracker.repositories.UserRepository;
import com.MoneyTracker.MoneyTracker.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public String signup(UserSignupDTO signupDTO) {
        if (userRepository.findByEmail(signupDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setFirstName(signupDTO.getFirstName());
        user.setLastName(signupDTO.getLastName());
        user.setEmail(signupDTO.getEmail());
        user.setPassword(passwordEncoder.encode(signupDTO.getPassword()));
        user.setJobType(signupDTO.getJobType());

        userRepository.save(user);
        return "User registered successfully";
    }

    public Map<String, Object> login(UserLoginDTO loginDTO) {
        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("token", token);
        return response;
    }
}