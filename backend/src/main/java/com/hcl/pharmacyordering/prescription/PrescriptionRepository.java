package com.hcl.pharmacyordering.prescription;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    boolean existsByUser_IdAndProduct_IdAndStatus(Long userId, Long productId, PrescriptionStatus status);

    @EntityGraph(attributePaths = {"product", "reviewedBy"})
    List<Prescription> findAllByUser_IdOrderByUploadedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"product", "user", "reviewedBy"})
    List<Prescription> findAllByStatusOrderByUploadedAtAsc(PrescriptionStatus status);
}
