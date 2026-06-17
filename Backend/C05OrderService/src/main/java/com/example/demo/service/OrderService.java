package com.example.demo.service;

import java.util.List;
import com.example.demo.dto.OrderDTO;

public interface OrderService {

    OrderDTO placeOrder(OrderDTO orderDTO);
    List<OrderDTO> getAllOrders();

    OrderDTO getOrderById(Long id);
    List<OrderDTO> getOrdersByCustomerId(Long customerId);

    OrderDTO makePayment(Long id);
    OrderDTO cancelOrder(Long id);

    void deleteOrder(Long id);
}