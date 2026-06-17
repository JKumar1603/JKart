package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.ProductDTO;

public interface ProductService {

    ProductDTO addProduct(ProductDTO productDTO);

    List<ProductDTO> getAllProducts();

    List<ProductDTO> getApprovedProducts();

    ProductDTO getProductById(Long id);

    ProductDTO updateProduct(Long id, ProductDTO productDTO);

    ProductDTO approveProduct(Long id);

    ProductDTO rejectProduct(Long id);

    ProductDTO updateQuantity(Long id, Integer quantity);

    void deleteProduct(Long id);

    List<ProductDTO> searchProducts(String name);

    List<ProductDTO> getProductsByVendor(String vendor);
}