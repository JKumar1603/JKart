package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ProductDTO;
import com.example.demo.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ProductDTO addProduct(@Valid @RequestBody ProductDTO productDTO) {
        return productService.addProduct(productDTO);
    }

    @GetMapping
    public List<ProductDTO> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/approved")
    public List<ProductDTO> getApprovedProducts() {
        return productService.getApprovedProducts();
    }

    @GetMapping("/{id}")
    public ProductDTO getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PutMapping("/{id}")
    public ProductDTO updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO productDTO) {
        return productService.updateProduct(id, productDTO);
    }

    @PutMapping("/{id}/approve")
    public ProductDTO approveProduct(@PathVariable Long id) {
        return productService.approveProduct(id);
    }

    @PutMapping("/{id}/reject")
    public ProductDTO rejectProduct(@PathVariable Long id) {
        return productService.rejectProduct(id);
    }

    @PutMapping("/{id}/quantity")
    public ProductDTO updateQuantity(@PathVariable Long id, @RequestParam Integer quantity) {
        return productService.updateQuantity(id, quantity);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return "Product deleted successfully";
    }

    @GetMapping("/search")
    public List<ProductDTO> searchProducts(@RequestParam String name) {
        return productService.searchProducts(name);
    }

    @GetMapping("/vendor/{vendor}")
    public List<ProductDTO> getProductsByVendor(@PathVariable String vendor) {
        return productService.getProductsByVendor(vendor);
    }

    @GetMapping("/test")
    public String test() {
        return "Product Service is working";
    }
}