package com.hcl.pharmacyordering.order;

import com.hcl.pharmacyordering.exception.BusinessRuleViolationException;
import com.hcl.pharmacyordering.prescription.PrescriptionRepository;
import com.hcl.pharmacyordering.product.Product;
import com.hcl.pharmacyordering.product.ProductRepository;
import com.hcl.pharmacyordering.user.Role;
import com.hcl.pharmacyordering.user.UserAccount;
import com.hcl.pharmacyordering.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    private UserAccount user;

    @BeforeEach
    void setUp() {
        user = UserAccount.builder()
                .id(10L)
                .fullName("Test User")
                .email("user@example.com")
                .passwordHash("encoded")
                .role(Role.CUSTOMER)
                .build();
    }

    @Test
    void shouldPlaceOrderAndReduceStock() {
        Product product = Product.builder()
                .id(1L)
                .name("Paracetamol 500mg")
                .price(BigDecimal.valueOf(20))
                .stockQuantity(10)
                .requiresPrescription(false)
                .description("Pain relief")
                .build();

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(productRepository.findAllByIdInForUpdate(any())).thenReturn(List.of(product));
        when(orderRepository.save(any(CustomerOrder.class))).thenAnswer(invocation -> {
            CustomerOrder order = invocation.getArgument(0);
            order.setId(100L);
            return order;
        });

        PlaceOrderRequest request = new PlaceOrderRequest(
                "Bengaluru",
                List.of(new OrderItemRequest(1L, 2))
        );

        OrderResponse response = orderService.placeOrder(user.getId(), request);

        assertThat(response.orderId()).isEqualTo(100L);
        assertThat(response.totalAmount()).isEqualByComparingTo("40");
        assertThat(product.getStockQuantity()).isEqualTo(8);

        ArgumentCaptor<CustomerOrder> orderCaptor = ArgumentCaptor.forClass(CustomerOrder.class);
        verify(orderRepository).save(orderCaptor.capture());
        assertThat(orderCaptor.getValue().getItems()).hasSize(1);
    }

    @Test
    void shouldRejectDuplicateProductsInSingleOrder() {
        PlaceOrderRequest request = new PlaceOrderRequest(
                "Bengaluru",
                List.of(new OrderItemRequest(1L, 1), new OrderItemRequest(1L, 2))
        );

        assertThatThrownBy(() -> orderService.placeOrder(user.getId(), request))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("Duplicate products");
    }
}
