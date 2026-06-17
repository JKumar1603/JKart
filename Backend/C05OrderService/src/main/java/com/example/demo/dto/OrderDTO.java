package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderDTO {

    private Long id;

    @NotNull(message = "Customer id is required")
    private Long customerId;

    private String customerEmail;

    @NotNull(message = "Product id is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private Double totalAmount;

    private String orderStatus;

    private String paymentStatus;
}

