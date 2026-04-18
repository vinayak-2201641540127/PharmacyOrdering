package com.hcl.pharmacyordering.prescription;

import java.time.Instant;

public record PrescriptionResponse(
        Long id,
        Long productId,
        String productName,
        PrescriptionStatus status,
        String originalFileName,
        Instant uploadedAt,
        String reviewedByName,
        Instant reviewedAt
) {
}
