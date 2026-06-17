package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtUtil;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {

        registerRequest = new RegisterRequest();
        registerRequest.setName("Jay Kumar");
        registerRequest.setEmail("jay@gmail.com");
        registerRequest.setPassword("1234");
        registerRequest.setRole("CUSTOMER");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("jay@gmail.com");
        loginRequest.setPassword("1234");

        user = new User();
        user.setId(1L);
        user.setName("Jay Kumar");
        user.setEmail("jay@gmail.com");
        user.setPassword("encodedPassword");
        user.setRole("CUSTOMER");
    }

    @Test
    void registerSuccessTest() {

        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class))).thenReturn(user);
        when(jwtUtil.generateToken(user.getEmail())).thenReturn("test-token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("test-token", response.getToken());
        assertEquals("Registration successful", response.getMessage());
        assertEquals(1L, response.getUserId());
        assertEquals("Jay Kumar", response.getName());
        assertEquals("jay@gmail.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());

        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(userRepository).save(org.mockito.ArgumentMatchers.any(User.class));
        verify(jwtUtil).generateToken(user.getEmail());
    }

    @Test
    void registerDuplicateEmailTest() {

        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.register(registerRequest);
        });

        assertEquals("User already exists with this email", exception.getMessage());

        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any(User.class));
    }

    @Test
    void loginSuccessTest() {

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user.getEmail())).thenReturn("login-token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("login-token", response.getToken());
        assertEquals("Login successful", response.getMessage());
        assertEquals(1L, response.getUserId());
        assertEquals("Jay Kumar", response.getName());
        assertEquals("jay@gmail.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());

        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), user.getPassword());
        verify(jwtUtil).generateToken(user.getEmail());
    }

    @Test
    void loginUserNotFoundTest() {

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("User not found with this email", exception.getMessage());

        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder, never()).matches(loginRequest.getPassword(), user.getPassword());
    }

    @Test
    void loginInvalidPasswordTest() {

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Invalid password", exception.getMessage());

        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), user.getPassword());
        verify(jwtUtil, never()).generateToken(user.getEmail());
    }
}