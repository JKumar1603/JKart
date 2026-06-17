package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.example.demo.dto.ProductDTO;
import com.example.demo.entity.Product;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProductRepository;

@Service
public class ProductServiceImpl implements ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ProductDTO addProduct(ProductDTO productDTO) {

        logger.info("Adding new product with name: {}", productDTO.getName());

        Product product = new Product();
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setQuantity(productDTO.getQuantity());
        product.setVendor(productDTO.getVendor());
        product.setStatus("PENDING");
        product.setCategory(productDTO.getCategory());
        product.setImageUrl(productDTO.getImageUrl());

        Product savedProduct = productRepository.save(product);

        logger.info("Product added successfully with id: {}", savedProduct.getId());

        return convertToDTO(savedProduct);
    }

    @Override
    public List<ProductDTO> getAllProducts() {
        logger.info("Fetching all products");

        return productRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> getApprovedProducts() {
        logger.info("Fetching all approved products");

        return productRepository.findByStatus("APPROVED")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDTO getProductById(Long id) {

        logger.info("Fetching product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Product not found with id: {}", id);
                    return new ResourceNotFoundException("Product not found with id: " + id);
                });

        return convertToDTO(product);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {

        logger.info("Updating product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Product update failed. Product not found with id: {}", id);
                    return new ResourceNotFoundException("Product not found with id: " + id);
                });

        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setQuantity(productDTO.getQuantity());
        product.setVendor(productDTO.getVendor());
        product.setCategory(productDTO.getCategory());
        product.setImageUrl(productDTO.getImageUrl());

        Product updatedProduct = productRepository.save(product);

        logger.info("Product updated successfully with id: {}", updatedProduct.getId());

        return convertToDTO(updatedProduct);
    }

    @Override
    public ProductDTO approveProduct(Long id) {

        logger.info("Approving product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Product approval failed. Product not found with id: {}", id);
                    return new ResourceNotFoundException("Product not found with id: " + id);
                });

        product.setStatus("APPROVED");

        Product updatedProduct = productRepository.save(product);

        logger.info("Product approved successfully with id: {}", updatedProduct.getId());

        return convertToDTO(updatedProduct);
    }

    @Override
    public ProductDTO rejectProduct(Long id) {

        logger.info("Rejecting product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Product rejection failed. Product not found with id: {}", id);
                    return new ResourceNotFoundException("Product not found with id: " + id);
                });

        product.setStatus("REJECTED");

        Product updatedProduct = productRepository.save(product);

        logger.info("Product rejected successfully with id: {}", updatedProduct.getId());

        return convertToDTO(updatedProduct);
    }

    @Override
    public ProductDTO updateQuantity(Long id, Integer quantity) {

        logger.info("Updating product quantity. Product id: {}, new quantity: {}", id, quantity);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Quantity update failed. Product not found with id: {}", id);
                    return new ResourceNotFoundException("Product not found with id: " + id);
                });

        product.setQuantity(quantity);

        Product updatedProduct = productRepository.save(product);

        logger.info("Product quantity updated successfully. Product id: {}", updatedProduct.getId());

        return convertToDTO(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {

        logger.info("Deleting product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Product delete failed. Product not found with id: {}", id);
                    return new ResourceNotFoundException("Product not found with id: " + id);
                });

        productRepository.delete(product);

        logger.info("Product deleted successfully with id: {}", id);
    }

    @Override
    public List<ProductDTO> searchProducts(String name) {

        logger.info("Searching products with name: {}", name);

        return productRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> getProductsByVendor(String vendor) {

        logger.info("Fetching products for vendor: {}", vendor);

        return productRepository.findByVendor(vendor)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProductDTO convertToDTO(Product product) {

        ProductDTO productDTO = new ProductDTO();

        productDTO.setId(product.getId());
        productDTO.setName(product.getName());
        productDTO.setDescription(product.getDescription());
        productDTO.setPrice(product.getPrice());
        productDTO.setQuantity(product.getQuantity());
        productDTO.setVendor(product.getVendor());
        productDTO.setStatus(product.getStatus());
        productDTO.setCategory(product.getCategory());
        productDTO.setImageUrl(product.getImageUrl());

        return productDTO;
    }
}

