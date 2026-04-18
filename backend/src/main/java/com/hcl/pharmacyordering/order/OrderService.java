package com.hcl.pharmacyordering.order;

import com.hcl.pharmacyordering.exception.BusinessRuleViolationException;
import com.hcl.pharmacyordering.exception.ResourceNotFoundException;
import com.hcl.pharmacyordering.prescription.PrescriptionRepository;
import com.hcl.pharmacyordering.prescription.PrescriptionStatus;
import com.hcl.pharmacyordering.product.Product;
import com.hcl.pharmacyordering.product.ProductRepository;
import com.hcl.pharmacyordering.security.UserPrincipal;
import com.hcl.pharmacyordering.user.Role;
import com.hcl.pharmacyordering.user.UserAccount;
import com.hcl.pharmacyordering.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {
        validateUniqueProducts(request.items());

        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Set<Long> productIds = request.items().stream()
                .map(OrderItemRequest::productId)
                .collect(java.util.stream.Collectors.toSet());

        List<Product> lockedProducts = productRepository.findAllByIdInForUpdate(productIds);

        if (lockedProducts.size() != productIds.size()) {
            throw new ResourceNotFoundException("One or more products were not found.");
        }

        Map<Long, Product> productsById = new HashMap<>();
        lockedProducts.forEach(product -> productsById.put(product.getId(), product));

        CustomerOrder order = CustomerOrder.builder()
                .user(user)
                .deliveryAddress(request.deliveryAddress().trim())
                .status(OrderStatus.PLACED)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.items()) {
            Product product = productsById.get(itemRequest.productId());

            if (product.isRequiresPrescription() && !prescriptionRepository.existsByUser_IdAndProduct_IdAndStatus(
                    userId,
                    product.getId(),
                    PrescriptionStatus.APPROVED
            )) {
                throw new BusinessRuleViolationException("An approved prescription is required for " + product.getName() + ".");
            }

            if (product.getStockQuantity() < itemRequest.quantity()) {
                throw new BusinessRuleViolationException("Insufficient stock for " + product.getName() + ".");
            }

            product.setStockQuantity(product.getStockQuantity() - itemRequest.quantity());

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(product.getPrice())
                    .build();

            order.addItem(orderItem);
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
        }

        order.setTotalAmount(totalAmount);
        CustomerOrder savedOrder = orderRepository.save(order);

        return toResponse(savedOrder);
    }

    public List<OrderResponse> findMyOrders(Long userId) {
        return orderRepository.findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse findOrder(Long orderId, UserPrincipal userPrincipal) {
        CustomerOrder order = userPrincipal.role() == Role.ADMIN
                ? orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"))
                : orderRepository.findByIdAndUser_Id(orderId, userPrincipal.id())
                        .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return toResponse(order);
    }

    private OrderResponse toResponse(CustomerOrder order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getDeliveryAddress(),
                order.getCreatedAt(),
                itemResponses
        );
    }

    private void validateUniqueProducts(List<OrderItemRequest> items) {
        Set<Long> productIds = new HashSet<>();

        for (OrderItemRequest item : items) {
            if (!productIds.add(item.productId())) {
                throw new BusinessRuleViolationException("Duplicate products are not allowed in a single order.");
            }
        }
    }
}
