package com.example.demo.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "C06NOTIFICATIONSERVICE")
public interface NotificationFeignClient {

    @GetMapping("/api/notifications/order")
    String sendOrderConfirmation(@RequestParam String email, @RequestParam Long orderId);

    @GetMapping("/api/notifications/payment")
    String sendPaymentConfirmation(@RequestParam String email, @RequestParam Long orderId);
}