package com.example.demo.service;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.AuthStatsResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.OtpVerifyRequest;
import com.example.demo.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthStatsResponse getAuthStats();

    String sendRegistrationOtp(RegisterRequest request);

    AuthResponse verifyOtpAndRegister(OtpVerifyRequest request);
}



















//package com.example.demo.service;
//
//import com.example.demo.dto.AuthResponse;
//import com.example.demo.dto.LoginRequest;
//import com.example.demo.dto.RegisterRequest;
//import com.example.demo.dto.AuthStatsResponse;
//
//public interface AuthService {
//
//    AuthResponse register(RegisterRequest request);
//    AuthResponse login(LoginRequest request);
//    AuthStatsResponse getAuthStats();
//}