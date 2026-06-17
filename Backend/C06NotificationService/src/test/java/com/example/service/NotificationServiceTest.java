package com.example.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.demo.service.NotificationService;

public class NotificationServiceTest {

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService();
    }

    @Test
    void sendRegistrationNotificationTest() {

        String response = notificationService.sendRegistrationNotification("jay@gmail.com", "Jay Kumar");

        assertNotNull(response);
        assertEquals("Registration successful for Jay Kumar with email jay@gmail.com", response);
    }

    @Test
    void sendOrderConfirmationTest() {

        String response = notificationService.sendOrderConfirmation("jay@gmail.com", 1L);

        assertNotNull(response);
        assertEquals("Order confirmed successfully. Order ID: 1. Notification sent to jay@gmail.com", response);
    }

    @Test
    void sendPaymentConfirmationTest() {

        String response = notificationService.sendPaymentConfirmation("jay@gmail.com", 1L);

        assertNotNull(response);
        assertEquals("Payment completed successfully for Order ID: 1. Notification sent to jay@gmail.com", response);
    }

    @Test
    void sendCustomNotificationTest() {

        String response = notificationService.sendCustomNotification("jay@gmail.com", "Your order has been shipped");

        assertNotNull(response);
        assertEquals("Notification sent to jay@gmail.com: Your order has been shipped", response);
    }
}