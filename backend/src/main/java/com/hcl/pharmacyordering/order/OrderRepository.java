package com.hcl.pharmacyordering.order;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<CustomerOrder> findById(Long id);

    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<CustomerOrder> findByIdAndUser_Id(Long id, Long userId);

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<CustomerOrder> findAllByUser_IdOrderByCreatedAtDesc(Long userId);
}
