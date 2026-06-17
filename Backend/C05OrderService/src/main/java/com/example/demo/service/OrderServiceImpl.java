package com.example.demo.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.example.demo.dto.OrderDTO;
import com.example.demo.entity.Order;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.feign.NotificationFeignClient;
import com.example.demo.feign.ProductFeignClient;
import com.example.demo.repository.OrderRepository;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final ProductFeignClient productFeignClient;
    private final NotificationFeignClient notificationFeignClient;

    public OrderServiceImpl(OrderRepository orderRepository,
                            ProductFeignClient productFeignClient,
                            NotificationFeignClient notificationFeignClient) {
        this.orderRepository = orderRepository;
        this.productFeignClient = productFeignClient;
        this.notificationFeignClient = notificationFeignClient;
    }

    @Override
    public OrderDTO placeOrder(OrderDTO orderDTO) {

        logger.info("Placing order for customer id: {}, product id: {}", orderDTO.getCustomerId(), orderDTO.getProductId());

        Map<String, Object> product = productFeignClient.getProductById(orderDTO.getProductId());

        Double price = Double.valueOf(product.get("price").toString());
        Integer availableQuantity = Integer.valueOf(product.get("quantity").toString());
        String status = product.get("status").toString();

        if (!status.equalsIgnoreCase("APPROVED")) {
            logger.warn("Order failed. Product is not approved. Product id: {}", orderDTO.getProductId());
            throw new RuntimeException("Product is not approved for order");
        }

        if (availableQuantity < orderDTO.getQuantity()) {
            logger.warn("Order failed. Insufficient quantity for product id: {}", orderDTO.getProductId());
            throw new RuntimeException("Insufficient product quantity");
        }

        Double totalAmount = price * orderDTO.getQuantity();

        Order order = new Order();
        order.setCustomerId(orderDTO.getCustomerId());
        order.setProductId(orderDTO.getProductId());
        order.setQuantity(orderDTO.getQuantity());
        order.setTotalAmount(totalAmount);
        order.setOrderStatus("PLACED");
        order.setPaymentStatus("PENDING");

        Order savedOrder = orderRepository.save(order);

        logger.info("Order placed successfully with id: {}", savedOrder.getId());

        Integer updatedQuantity = availableQuantity - orderDTO.getQuantity();
        productFeignClient.updateQuantity(orderDTO.getProductId(), updatedQuantity);

        logger.info("Product quantity updated after order. Product id: {}, remaining quantity: {}",
                orderDTO.getProductId(), updatedQuantity);

        try {
            notificationFeignClient.sendOrderConfirmation(orderDTO.getCustomerEmail(), savedOrder.getId());
            logger.info("Order notification sent successfully for order id: {}", savedOrder.getId());
        } catch (Exception e) {
            logger.error("Notification service not available for order notification: {}", e.getMessage());
        }

        return convertToDTO(savedOrder);
    }

    @Override
    public List<OrderDTO> getAllOrders() {

        logger.info("Fetching all orders");

        return orderRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO getOrderById(Long id) {

        logger.info("Fetching order with id: {}", id);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Order not found with id: {}", id);
                    return new ResourceNotFoundException("Order not found with id: " + id);
                });

        return convertToDTO(order);
    }

    @Override
    public List<OrderDTO> getOrdersByCustomerId(Long customerId) {

        logger.info("Fetching orders for customer id: {}", customerId);

        return orderRepository.findByCustomerId(customerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO makePayment(Long id) {

        logger.info("Payment request received for order id: {}", id);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Payment failed. Order not found with id: {}", id);
                    return new ResourceNotFoundException("Order not found with id: " + id);
                });

        if (order.getOrderStatus().equalsIgnoreCase("CANCELLED")) {
            logger.warn("Payment failed. Order is already cancelled. Order id: {}", id);
            throw new RuntimeException("Payment cannot be done for cancelled order");
        }

        order.setPaymentStatus("PAID");
        order.setOrderStatus("CONFIRMED");

        Order updatedOrder = orderRepository.save(order);

        logger.info("Payment completed successfully for order id: {}", updatedOrder.getId());

        try {
            notificationFeignClient.sendPaymentConfirmation("customer@gmail.com", updatedOrder.getId());
            logger.info("Payment notification sent successfully for order id: {}", updatedOrder.getId());
        } catch (Exception e) {
            logger.error("Notification service not available for payment notification: {}", e.getMessage());
        }

        return convertToDTO(updatedOrder);
    }

    @Override
    public OrderDTO cancelOrder(Long id) {

        logger.info("Cancel order request received for order id: {}", id);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Cancel order failed. Order not found with id: {}", id);
                    return new ResourceNotFoundException("Order not found with id: " + id);
                });

        if (order.getPaymentStatus().equalsIgnoreCase("PAID")) {
            logger.warn("Cancel order failed. Order already paid. Order id: {}", id);
            throw new RuntimeException("Paid order cannot be cancelled");
        }

        order.setOrderStatus("CANCELLED");
        order.setPaymentStatus("FAILED");

        Order updatedOrder = orderRepository.save(order);

        logger.info("Order cancelled successfully with id: {}", updatedOrder.getId());

        return convertToDTO(updatedOrder);
    }

    @Override
    public void deleteOrder(Long id) {

        logger.info("Delete order request received for order id: {}", id);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Delete order failed. Order not found with id: {}", id);
                    return new ResourceNotFoundException("Order not found with id: " + id);
                });

        orderRepository.delete(order);

        logger.info("Order deleted successfully with id: {}", id);
    }

    private OrderDTO convertToDTO(Order order) {

        OrderDTO orderDTO = new OrderDTO();

        orderDTO.setId(order.getId());
        orderDTO.setCustomerId(order.getCustomerId());
        orderDTO.setProductId(order.getProductId());
        orderDTO.setQuantity(order.getQuantity());
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setOrderStatus(order.getOrderStatus());
        orderDTO.setPaymentStatus(order.getPaymentStatus());

        return orderDTO;
    }
}

