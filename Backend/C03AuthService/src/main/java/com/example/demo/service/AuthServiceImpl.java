package com.example.demo.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.AuthStatsResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.OtpVerifyRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtUtil;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final String MAIN_ADMIN_PASSWORD = "Jay@1234";
    private static final int OTP_EXPIRY_MINUTES = 5;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate = new RestTemplate();

    private final Map<String, RegisterRequest> pendingRegistrations = new ConcurrentHashMap<>();
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> otpExpiryStore = new ConcurrentHashMap<>();

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public String sendRegistrationOtp(RegisterRequest request) {
        logger.info("OTP registration request received for email: {}", request.getEmail());

        validateRegistrationRequest(request);

        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("OTP request failed. User already exists with email: {}", request.getEmail());
            throw new RuntimeException("User already exists with this email");
        }

        String role = request.getRole().trim().toUpperCase();

        if (role.equals("ADMIN") && !MAIN_ADMIN_PASSWORD.equals(request.getAdminPassword())) {
            logger.warn("OTP request failed due to invalid admin password for email: {}", request.getEmail());
            throw new RuntimeException("Invalid main admin password");
        }

        request.setRole(role);

        if (!role.equals("ADMIN")) {
            request.setAdminPassword(null);
        }

        String email = request.getEmail().trim().toLowerCase();
        String otp = generateOtp();

        pendingRegistrations.put(email, request);
        otpStore.put(email, otp);
        otpExpiryStore.put(email, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));

        sendOtpToNotificationService(request.getName(), email, otp);

        logger.info("OTP generated successfully for email: {}", email);
        return "OTP sent successfully. Please check Notification Service console.";
    }

    @Override
    public AuthResponse verifyOtpAndRegister(OtpVerifyRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String enteredOtp = request.getOtp().trim();

        logger.info("OTP verification request received for email: {}", email);

        if (!otpStore.containsKey(email) || !pendingRegistrations.containsKey(email)) {
            logger.warn("OTP verification failed. No pending registration found for email: {}", email);
            throw new RuntimeException("No OTP request found for this email");
        }

        LocalDateTime expiryTime = otpExpiryStore.get(email);

        if (expiryTime == null || LocalDateTime.now().isAfter(expiryTime)) {
            clearOtpData(email);
            logger.warn("OTP expired for email: {}", email);
            throw new RuntimeException("OTP expired. Please request a new OTP");
        }

        String savedOtp = otpStore.get(email);

        if (!savedOtp.equals(enteredOtp)) {
            logger.warn("Invalid OTP entered for email: {}", email);
            throw new RuntimeException("Invalid OTP");
        }

        RegisterRequest registerRequest = pendingRegistrations.get(email);
        clearOtpData(email);

        logger.info("OTP verified successfully for email: {}", email);
        return register(registerRequest);
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registration request received for email: {}", request.getEmail());

        validateRegistrationRequest(request);

        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Registration failed. User already exists with email: {}", request.getEmail());
            throw new RuntimeException("User already exists with this email");
        }

        String role = request.getRole().trim().toUpperCase();

        if (role.equals("ADMIN") && !MAIN_ADMIN_PASSWORD.equals(request.getAdminPassword())) {
            logger.warn("Admin registration failed due to invalid admin password for email: {}", request.getEmail());
            throw new RuntimeException("Invalid main admin password");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        User savedUser = userRepository.save(user);

        logger.info("User registered successfully with id: {} and role: {}", savedUser.getId(), savedUser.getRole());

        String token = jwtUtil.generateToken(savedUser.getEmail());

        return new AuthResponse(
                token,
                "Registration successful",
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    @Override
    public AuthStatsResponse getAuthStats() {
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole("CUSTOMER");
        long totalVendors = userRepository.countByRole("VENDOR");
        long totalAdmins = userRepository.countByRole("ADMIN");

        return new AuthStatsResponse(totalUsers, totalCustomers, totalVendors, totalAdmins);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        logger.info("Login request received for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.warn("Login failed. User not found with email: {}", request.getEmail());
                    return new ResourceNotFoundException("User not found with this email");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.warn("Login failed due to invalid password for email: {}", request.getEmail());
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        logger.info("User logged in successfully with email: {}", user.getEmail());

        return new AuthResponse(
                token,
                "Login successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    private void validateRegistrationRequest(RegisterRequest request) {
        String role = request.getRole().trim().toUpperCase();

        if (!role.equals("CUSTOMER") && !role.equals("VENDOR") && !role.equals("ADMIN")) {
            logger.warn("Registration failed due to invalid role: {}", request.getRole());
            throw new RuntimeException("Invalid role selected");
        }
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private void clearOtpData(String email) {
        pendingRegistrations.remove(email);
        otpStore.remove(email);
        otpExpiryStore.remove(email);
    }

    private void sendOtpToNotificationService(String name, String email, String otp) {
        try {
            String encodedName = URLEncoder.encode(name, StandardCharsets.UTF_8);
            String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
            String url = "http://localhost:8084/api/notifications/otp?email=" + encodedEmail + "&name=" + encodedName + "&otp=" + otp;
            restTemplate.getForObject(url, String.class);
        } catch (Exception exception) {
            logger.warn("Unable to call Notification Service. OTP for {} is {}", email, otp);
        }
    }
}

