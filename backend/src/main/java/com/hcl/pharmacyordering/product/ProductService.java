package com.hcl.pharmacyordering.product;

import com.hcl.pharmacyordering.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> findAll(String search) {
        List<Product> products = StringUtils.hasText(search)
                ? productRepository.findByNameContainingIgnoreCaseOrderByNameAsc(search.trim())
                : productRepository.findAllByOrderByNameAsc();

        return products.stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse findById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return toResponse(product);
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.isRequiresPrescription()
        );
    }
}
