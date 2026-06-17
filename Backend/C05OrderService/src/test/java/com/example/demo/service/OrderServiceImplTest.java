package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.OrderDTO;
import com.example.demo.entity.Order;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.feign.NotificationFeignClient;
import com.example.demo.feign.ProductFeignClient;
import com.example.demo.repository.OrderRepository;

@ExtendWith(MockitoExtension.class)
public class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductFeignClient productFeignClient;

    @Mock
    private NotificationFeignClient notificationFeignClient;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Order order;
    private OrderDTO orderDTO;
    private Map<String, Object> productMap;

    @BeforeEach
    void setUp() {

        orderDTO = new OrderDTO();
        orderDTO.setCustomerId(1L);
        orderDTO.setCustomerEmail("jay@gmail.com");
        orderDTO.setProductId(1L);
        orderDTO.setQuantity(2);

        order = new Order();
        order.setId(1L);
        order.setCustomerId(1L);
        order.setProductId(1L);
        order.setQuantity(2);
        order.setTotalAmount(3000.0);
        order.setOrderStatus("PLACED");
        order.setPaymentStatus("PENDING");

        productMap = new HashMap<>();
        productMap.put("id", 1);
        productMap.put("name", "Gaming Mouse");
        productMap.put("price", 1500.0);
        productMap.put("quantity", 20);
        productMap.put("status", "APPROVED");
    }

    @Test
    void placeOrderSuccessTest() {

        when(productFeignClient.getProductById(orderDTO.getProductId())).thenReturn(productMap);
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(productFeignClient.updateQuantity(1L, 18)).thenReturn(productMap);
        when(notificationFeignClient.sendOrderConfirmation("jay@gmail.com", 1L))
                .thenReturn("Order notification sent");

        OrderDTO response = orderService.placeOrder(orderDTO);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(1L, response.getCustomerId());
        assertEquals(1L, response.getProductId());
        assertEquals(2, response.getQuantity());
        assertEquals(3000.0, response.getTotalAmount());
        assertEquals("PLACED", response.getOrderStatus());
        assertEquals("PENDING", response.getPaymentStatus());

        verify(productFeignClient).getProductById(1L);
        verify(orderRepository).save(any(Order.class));
        verify(productFeignClient).updateQuantity(1L, 18);
        verify(notificationFeignClient).sendOrderConfirmation("jay@gmail.com", 1L);
    }

    @Test
    void placeOrderProductNotApprovedTest() {

        productMap.put("status", "PENDING");

        when(productFeignClient.getProductById(orderDTO.getProductId())).thenReturn(productMap);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.placeOrder(orderDTO);
        });

        assertEquals("Product is not approved for order", exception.getMessage());

        verify(productFeignClient).getProductById(1L);
        verify(orderRepository, never()).save(any(Order.class));
        verify(productFeignClient, never()).updateQuantity(1L, 18);
    }

    @Test
    void placeOrderInsufficientQuantityTest() {

        productMap.put("quantity", 1);

        when(productFeignClient.getProductById(orderDTO.getProductId())).thenReturn(productMap);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.placeOrder(orderDTO);
        });

        assertEquals("Insufficient product quantity", exception.getMessage());

        verify(productFeignClient).getProductById(1L);
        verify(orderRepository, never()).save(any(Order.class));
        verify(productFeignClient, never()).updateQuantity(1L, 18);
    }

    @Test
    void getOrderByIdSuccessTest() {

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        OrderDTO response = orderService.getOrderById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(1L, response.getCustomerId());
        assertEquals("PLACED", response.getOrderStatus());
        assertEquals("PENDING", response.getPaymentStatus());

        verify(orderRepository).findById(1L);
    }

    @Test
    void getOrderByIdNotFoundTest() {

        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            orderService.getOrderById(1L);
        });

        assertEquals("Order not found with id: 1", exception.getMessage());

        verify(orderRepository).findById(1L);
    }

    @Test
    void makePaymentSuccessTest() {

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        order.setPaymentStatus("PAID");
        order.setOrderStatus("CONFIRMED");

        when(orderRepository.save(order)).thenReturn(order);
        when(notificationFeignClient.sendPaymentConfirmation("customer@gmail.com", 1L))
                .thenReturn("Payment notification sent");

        OrderDTO response = orderService.makePayment(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("CONFIRMED", response.getOrderStatus());
        assertEquals("PAID", response.getPaymentStatus());

        verify(orderRepository).findById(1L);
        verify(orderRepository).save(order);
        verify(notificationFeignClient).sendPaymentConfirmation("customer@gmail.com", 1L);
    }

    @Test
    void makePaymentCancelledOrderTest() {

        order.setOrderStatus("CANCELLED");

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.makePayment(1L);
        });

        assertEquals("Payment cannot be done for cancelled order", exception.getMessage());

        verify(orderRepository).findById(1L);
        verify(orderRepository, never()).save(order);
    }

    @Test
    void cancelOrderSuccessTest() {

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        order.setOrderStatus("CANCELLED");
        order.setPaymentStatus("FAILED");

        when(orderRepository.save(order)).thenReturn(order);

        OrderDTO response = orderService.cancelOrder(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("CANCELLED", response.getOrderStatus());
        assertEquals("FAILED", response.getPaymentStatus());

        verify(orderRepository).findById(1L);
        verify(orderRepository).save(order);
    }

    @Test
    void cancelPaidOrderTest() {

        order.setPaymentStatus("PAID");

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.cancelOrder(1L);
        });

        assertEquals("Paid order cannot be cancelled", exception.getMessage());

        verify(orderRepository).findById(1L);
        verify(orderRepository, never()).save(order);
    }

    @Test
    void deleteOrderSuccessTest() {

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        doNothing().when(orderRepository).delete(order);

        orderService.deleteOrder(1L);

        verify(orderRepository).findById(1L);
        verify(orderRepository).delete(order);
    }

    @Test
    void deleteOrderNotFoundTest() {

        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            orderService.deleteOrder(1L);
        });

        assertEquals("Order not found with id: 1", exception.getMessage());

        verify(orderRepository).findById(1L);
        verify(orderRepository, never()).delete(order);
    }
}