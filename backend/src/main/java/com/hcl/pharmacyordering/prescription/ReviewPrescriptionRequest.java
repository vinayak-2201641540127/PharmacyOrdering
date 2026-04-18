package com.hcl.pharmacyordering.prescription;

import jakarta.validation.constraints.NotNull;

public record ReviewPrescriptionRequest(
        @NotNull(message = "Prescription status is required")
        PrescriptionStatus status
) {
}
