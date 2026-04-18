package com.hcl.pharmacyordering.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long orderId,
        BigDecimal totalAmount,
        OrderStatus status,
        String deliveryAddress,
        Instant createdAt,
        List<OrderItemResponse> items
) {
}
