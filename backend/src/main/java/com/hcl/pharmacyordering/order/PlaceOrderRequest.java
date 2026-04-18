package com.hcl.pharmacyordering.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PlaceOrderRequest(
        @NotBlank(message = "Delivery address is required")
        @Size(max = 500, message = "Delivery address must be under 500 characters")
        String deliveryAddress,
        @NotEmpty(message = "At least one order item is required")
        @Valid
        List<OrderItemRequest> items
) {
}
