package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.ProductDTO;
import com.example.demo.entity.Product;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
public class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product product;
    private ProductDTO productDTO;

    @BeforeEach
    void setUp() {

        product = new Product();
        product.setId(1L);
        product.setName("Laptop");
        product.setDescription("HP laptop with 16GB RAM");
        product.setPrice(65000.0);
        product.setQuantity(10);
        product.setVendor("Jay Electronics");
        product.setStatus("PENDING");

        productDTO = new ProductDTO();
        productDTO.setId(1L);
        productDTO.setName("Laptop");
        productDTO.setDescription("HP laptop with 16GB RAM");
        productDTO.setPrice(65000.0);
        productDTO.setQuantity(10);
        productDTO.setVendor("Jay Electronics");
        productDTO.setStatus("PENDING");
    }

    @Test
    void addProductSuccessTest() {

        when(productRepository.save(any(Product.class))).thenReturn(product);

        ProductDTO response = productService.addProduct(productDTO);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Laptop", response.getName());
        assertEquals("HP laptop with 16GB RAM", response.getDescription());
        assertEquals(65000.0, response.getPrice());
        assertEquals(10, response.getQuantity());
        assertEquals("Jay Electronics", response.getVendor());
        assertEquals("PENDING", response.getStatus());

        verify(productRepository).save(any(Product.class));
    }

    @Test
    void getAllProductsSuccessTest() {

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Mouse");
        product2.setDescription("Wireless Mouse");
        product2.setPrice(999.0);
        product2.setQuantity(25);
        product2.setVendor("Jay Electronics");
        product2.setStatus("APPROVED");

        when(productRepository.findAll()).thenReturn(Arrays.asList(product, product2));

        List<ProductDTO> response = productService.getAllProducts();

        assertNotNull(response);
        assertEquals(2, response.size());

        assertEquals(1L, response.get(0).getId());
        assertEquals("Laptop", response.get(0).getName());

        assertEquals(2L, response.get(1).getId());
        assertEquals("Mouse", response.get(1).getName());

        verify(productRepository).findAll();
    }

    @Test
    void getApprovedProductsSuccessTest() {

        product.setStatus("APPROVED");

        when(productRepository.findByStatus("APPROVED")).thenReturn(Arrays.asList(product));

        List<ProductDTO> response = productService.getApprovedProducts();

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
        assertEquals("APPROVED", response.get(0).getStatus());

        verify(productRepository).findByStatus("APPROVED");
    }

    @Test
    void getProductByIdSuccessTest() {

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ProductDTO response = productService.getProductById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Laptop", response.getName());
        assertEquals("PENDING", response.getStatus());

        verify(productRepository).findById(1L);
    }

    @Test
    void getProductByIdNotFoundTest() {

        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            productService.getProductById(1L);
        });

        assertEquals("Product not found with id: 1", exception.getMessage());

        verify(productRepository).findById(1L);
    }

    @Test
    void updateProductSuccessTest() {

        ProductDTO updatedDTO = new ProductDTO();
        updatedDTO.setName("Updated Laptop");
        updatedDTO.setDescription("Updated HP laptop");
        updatedDTO.setPrice(70000.0);
        updatedDTO.setQuantity(15);
        updatedDTO.setVendor("Updated Vendor");

        Product updatedProduct = new Product();
        updatedProduct.setId(1L);
        updatedProduct.setName("Updated Laptop");
        updatedProduct.setDescription("Updated HP laptop");
        updatedProduct.setPrice(70000.0);
        updatedProduct.setQuantity(15);
        updatedProduct.setVendor("Updated Vendor");
        updatedProduct.setStatus("PENDING");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);

        ProductDTO response = productService.updateProduct(1L, updatedDTO);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Updated Laptop", response.getName());
        assertEquals("Updated HP laptop", response.getDescription());
        assertEquals(70000.0, response.getPrice());
        assertEquals(15, response.getQuantity());
        assertEquals("Updated Vendor", response.getVendor());
        assertEquals("PENDING", response.getStatus());

        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProductNotFoundTest() {

        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            productService.updateProduct(1L, productDTO);
        });

        assertEquals("Product not found with id: 1", exception.getMessage());

        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void approveProductSuccessTest() {

        Product approvedProduct = new Product();
        approvedProduct.setId(1L);
        approvedProduct.setName("Laptop");
        approvedProduct.setDescription("HP laptop with 16GB RAM");
        approvedProduct.setPrice(65000.0);
        approvedProduct.setQuantity(10);
        approvedProduct.setVendor("Jay Electronics");
        approvedProduct.setStatus("APPROVED");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(approvedProduct);

        ProductDTO response = productService.approveProduct(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("APPROVED", response.getStatus());

        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void approveProductNotFoundTest() {

        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            productService.approveProduct(1L);
        });

        assertEquals("Product not found with id: 1", exception.getMessage());

        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void rejectProductSuccessTest() {

        Product rejectedProduct = new Product();
        rejectedProduct.setId(1L);
        rejectedProduct.setName("Laptop");
        rejectedProduct.setDescription("HP laptop with 16GB RAM");
        rejectedProduct.setPrice(65000.0);
        rejectedProduct.setQuantity(10);
        rejectedProduct.setVendor("Jay Electronics");
        rejectedProduct.setStatus("REJECTED");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(rejectedProduct);

        ProductDTO response = productService.rejectProduct(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("REJECTED", response.getStatus());

        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void rejectProductNotFoundTest() {

        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            productService.rejectProduct(1L);
        });

        assertEquals("Product not found with id: 1", exception.getMessage());

        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void updateQuantitySuccessTest() {

        Product updatedProduct = new Product();
        updatedProduct.setId(1L);
        updatedProduct.setName("Laptop");
        updatedProduct.setDescription("HP laptop with 16GB RAM");
        updatedProduct.setPrice(65000.0);
        updatedProduct.setQuantity(20);
        updatedProduct.setVendor("Jay Electronics");
        updatedProduct.setStatus("PENDING");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);

        ProductDTO response = productService.updateQuantity(1L, 20);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(20, response.getQuantity());

        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateQuantityNotFoundTest() {

        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            productService.updateQuantity(1L, 20);
        });

        assertEquals("Product not found with id: 1", exception.getMessage());

        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void deleteProductSuccessTest() {

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.deleteProduct(1L);

        verify(productRepository).findById(1L);
        verify(productRepository).delete(product);
    }

    @Test
    void deleteProductNotFoundTest() {

        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            productService.deleteProduct(1L);
        });

        assertEquals("Product not found with id: 1", exception.getMessage());

        verify(productRepository).findById(1L);
        verify(productRepository, never()).delete(product);
    }

    @Test
    void searchProductsSuccessTest() {

        when(productRepository.findByNameContainingIgnoreCase("Laptop"))
                .thenReturn(Arrays.asList(product));

        List<ProductDTO> response = productService.searchProducts("Laptop");

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
        assertEquals("Laptop", response.get(0).getName());

        verify(productRepository).findByNameContainingIgnoreCase("Laptop");
    }

    @Test
    void getProductsByVendorSuccessTest() {

        when(productRepository.findByVendor("Jay Electronics"))
                .thenReturn(Arrays.asList(product));

        List<ProductDTO> response = productService.getProductsByVendor("Jay Electronics");

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
        assertEquals("Jay Electronics", response.get(0).getVendor());

        verify(productRepository).findByVendor("Jay Electronics");
    }
}

//package com.example.demo.service;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertNotNull;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.never;
//import static org.mockito.Mockito.verify;
//import static org.mockito.Mockito.when;
//
//import java.util.Optional;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import com.example.demo.dto.ProductDTO;
//import com.example.demo.entity.Product;
//import com.example.demo.exception.ResourceNotFoundException;
//import com.example.demo.repository.ProductRepository;
//
//@ExtendWith(MockitoExtension.class)
//public class ProductServiceImplTest {
//
//    @Mock
//    private ProductRepository productRepository;
//
//    @InjectMocks
//    private ProductServiceImpl productService;
//
//    private Product product;
//    private ProductDTO productDTO;
//
//    @BeforeEach
//    void setUp() {
//
//        product = new Product();
//        product.setId(1L);
//        product.setName("Laptop");
//        product.setDescription("HP laptop with 16GB RAM");
//        product.setPrice(65000.0);
//        product.setQuantity(10);
//        product.setVendor("Jay Electronics");
//        product.setStatus("PENDING");
//
//        productDTO = new ProductDTO();
//        productDTO.setId(1L);
//        productDTO.setName("Laptop");
//        productDTO.setDescription("HP laptop with 16GB RAM");
//        productDTO.setPrice(65000.0);
//        productDTO.setQuantity(10);
//        productDTO.setVendor("Jay Electronics");
//        productDTO.setStatus("PENDING");
//    }
//
//    @Test
//    void addProductSuccessTest() {
//
//        when(productRepository.save(any(Product.class))).thenReturn(product);
//
//        ProductDTO response = productService.addProduct(productDTO);
//
//        assertNotNull(response);
//        assertEquals(1L, response.getId());
//        assertEquals("Laptop", response.getName());
//        assertEquals("HP laptop with 16GB RAM", response.getDescription());
//        assertEquals(65000.0, response.getPrice());
//        assertEquals(10, response.getQuantity());
//        assertEquals("Jay Electronics", response.getVendor());
//        assertEquals("PENDING", response.getStatus());
//
//        verify(productRepository).save(any(Product.class));
//    }
//
//    @Test
//    void getProductByIdSuccessTest() {
//
//        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
//
//        ProductDTO response = productService.getProductById(1L);
//
//        assertNotNull(response);
//        assertEquals(1L, response.getId());
//        assertEquals("Laptop", response.getName());
//        assertEquals("PENDING", response.getStatus());
//
//        verify(productRepository).findById(1L);
//    }
//
//    @Test
//    void getProductByIdNotFoundTest() {
//
//        when(productRepository.findById(1L)).thenReturn(Optional.empty());
//
//        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
//            productService.getProductById(1L);
//        });
//
//        assertEquals("Product not found with id: 1", exception.getMessage());
//
//        verify(productRepository).findById(1L);
//    }
//
//    @Test
//    void approveProductSuccessTest() {
//
//        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
//
//        product.setStatus("APPROVED");
//
//        when(productRepository.save(product)).thenReturn(product);
//
//        ProductDTO response = productService.approveProduct(1L);
//
//        assertNotNull(response);
//        assertEquals(1L, response.getId());
//        assertEquals("APPROVED", response.getStatus());
//
//        verify(productRepository).findById(1L);
//        verify(productRepository).save(product);
//    }
//
//    @Test
//    void rejectProductSuccessTest() {
//
//        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
//
//        product.setStatus("REJECTED");
//
//        when(productRepository.save(product)).thenReturn(product);
//
//        ProductDTO response = productService.rejectProduct(1L);
//
//        assertNotNull(response);
//        assertEquals(1L, response.getId());
//        assertEquals("REJECTED", response.getStatus());
//
//        verify(productRepository).findById(1L);
//        verify(productRepository).save(product);
//    }
//
//    @Test
//    void updateQuantitySuccessTest() {
//
//        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
//
//        product.setQuantity(20);
//
//        when(productRepository.save(product)).thenReturn(product);
//
//        ProductDTO response = productService.updateQuantity(1L, 20);
//
//        assertNotNull(response);
//        assertEquals(1L, response.getId());
//        assertEquals(20, response.getQuantity());
//
//        verify(productRepository).findById(1L);
//        verify(productRepository).save(product);
//    }
//
//    @Test
//    void deleteProductSuccessTest() {
//
//        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
//
//        productService.deleteProduct(1L);
//
//        verify(productRepository).findById(1L);
//        verify(productRepository).delete(product);
//    }
//
//    @Test
//    void deleteProductNotFoundTest() {
//
//        when(productRepository.findById(1L)).thenReturn(Optional.empty());
//
//        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
//            productService.deleteProduct(1L);
//        });
//
//        assertEquals("Product not found with id: 1", exception.getMessage());
//
//        verify(productRepository).findById(1L);
//        verify(productRepository, never()).delete(product);
//    }
//}