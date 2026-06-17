package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class C06NotificationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(C06NotificationServiceApplication.class, args);
		System.out.println("Notification Service Running...");
	}

}
