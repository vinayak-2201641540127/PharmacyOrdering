package com.hcl.pharmacyordering.product;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        boolean requiresPrescription
) {
}
