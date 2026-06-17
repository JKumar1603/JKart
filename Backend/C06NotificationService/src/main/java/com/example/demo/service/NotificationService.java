package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    public String sendRegistrationNotification(String email, String name) {

        String message = "Registration successful for " + name + " with email " + email;

        logger.info("Registration notification sent to email: {}", email);

        return message;
    }

    public String sendOrderConfirmation(String email, Long orderId) {

        String message = "Order confirmed successfully. Order ID: " + orderId + ". Notification sent to " + email;

        logger.info("Order confirmation notification sent. Order id: {}, email: {}", orderId, email);

        return message;
    }

    public String sendPaymentConfirmation(String email, Long orderId) {

        String message = "Payment completed successfully for Order ID: " + orderId + ". Notification sent to " + email;

        logger.info("Payment confirmation notification sent. Order id: {}, email: {}", orderId, email);

        return message;
    }

    public String sendCustomNotification(String email, String message) {

        String notification = "Notification sent to " + email + ": " + message;

        logger.info("Custom notification sent to email: {}", email);

        return notification;
    }
}

