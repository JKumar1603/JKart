package com.example.demo.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @GetMapping("/test")
    public ResponseEntity<String> testNotificationService() {
        return ResponseEntity.ok("Notification Service is working");
    }

    @GetMapping("/registration")
    public ResponseEntity<String> registrationNotification(@RequestParam String email, @RequestParam String name) {
        logger.info("Registration notification sent to {} for user {}", email, name);
        return ResponseEntity.ok("Registration notification logged successfully");
    }

    @GetMapping("/otp")
    public ResponseEntity<String> otpNotification(@RequestParam String email, @RequestParam String name, @RequestParam String otp) {
        logger.info("Registration OTP for {} ({}) is: {}", name, email, otp);
        return ResponseEntity.ok("Registration OTP logged successfully");
    }

    @GetMapping("/order")
    public ResponseEntity<String> orderNotification(@RequestParam String email, @RequestParam Long orderId) {
        logger.info("Order confirmation notification sent to {} for order id {}", email, orderId);
        return ResponseEntity.ok("Order notification logged successfully");
    }

    @GetMapping("/payment")
    public ResponseEntity<String> paymentNotification(@RequestParam String email, @RequestParam Long orderId) {
        logger.info("Payment confirmation notification sent to {} for order id {}", email, orderId);
        return ResponseEntity.ok("Payment notification logged successfully");
    }

    @GetMapping("/custom")
    public ResponseEntity<String> customNotification(@RequestParam String email, @RequestParam String message) {
        logger.info("Custom notification sent to {} with message: {}", email, message);
        return ResponseEntity.ok("Custom notification logged successfully");
    }
}


