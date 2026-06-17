package com.example.demo.feign;

import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "C04ProductService")
public interface ProductFeignClient {

    @GetMapping("/api/products/{id}")
    Map<String, Object> getProductById(@PathVariable Long id);

    @PutMapping("/api/products/{id}/quantity")
    Map<String, Object> updateQuantity(@PathVariable Long id, @RequestParam Integer quantity);
}