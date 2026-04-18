package com.hcl.pharmacyordering.order;

import com.hcl.pharmacyordering.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody PlaceOrderRequest request
    ) {
        return orderService.placeOrder(user.id(), request);
    }

    @GetMapping("/{orderId}")
    public OrderResponse getOrder(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long orderId
    ) {
        return orderService.findOrder(orderId, user);
    }

    @GetMapping("/my")
    public List<OrderResponse> getMyOrders(@AuthenticationPrincipal UserPrincipal user) {
        return orderService.findMyOrders(user.id());
    }
}
