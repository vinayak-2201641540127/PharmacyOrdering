package com.hcl.pharmacyordering.prescription;

public record StoredPrescriptionFile(
        String originalFileName,
        String storagePath,
        String contentType,
        long fileSize
) {
}
