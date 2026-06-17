package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class C05OrderServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(C05OrderServiceApplication.class, args);
		System.out.println("Order Service Running...");
	}

}
