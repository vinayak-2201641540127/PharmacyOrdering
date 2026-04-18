package com.hcl.pharmacyordering.prescription;

import com.hcl.pharmacyordering.exception.BusinessRuleViolationException;
import com.hcl.pharmacyordering.exception.ResourceNotFoundException;
import com.hcl.pharmacyordering.product.Product;
import com.hcl.pharmacyordering.product.ProductRepository;
import com.hcl.pharmacyordering.user.UserAccount;
import com.hcl.pharmacyordering.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public PrescriptionResponse upload(Long userId, Long productId, MultipartFile file) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.isRequiresPrescription()) {
            throw new BusinessRuleViolationException("The selected product does not require a prescription upload.");
        }

        StoredPrescriptionFile storedFile = fileStorageService.storePrescription(file, userId);

        Prescription prescription = Prescription.builder()
                .user(user)
                .product(product)
                .originalFileName(storedFile.originalFileName())
                .storagePath(storedFile.storagePath())
                .contentType(storedFile.contentType())
                .fileSize(storedFile.fileSize())
                .status(PrescriptionStatus.PENDING)
                .build();

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        return toResponse(savedPrescription);
    }

    public List<PrescriptionResponse> findMine(Long userId) {
        return prescriptionRepository.findAllByUser_IdOrderByUploadedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PrescriptionResponse> findPending() {
        return prescriptionRepository.findAllByStatusOrderByUploadedAtAsc(PrescriptionStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PrescriptionResponse review(Long reviewerId, Long prescriptionId, ReviewPrescriptionRequest request) {
        if (request.status() == PrescriptionStatus.PENDING) {
            throw new BusinessRuleViolationException("Prescription review status must be APPROVED or REJECTED.");
        }

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));
        UserAccount reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        if (prescription.getStatus() != PrescriptionStatus.PENDING) {
            throw new BusinessRuleViolationException("This prescription has already been reviewed.");
        }

        prescription.setStatus(request.status());
        prescription.setReviewedBy(reviewer);
        prescription.setReviewedAt(Instant.now());

        return toResponse(prescription);
    }

    private PrescriptionResponse toResponse(Prescription prescription) {
        String reviewedByName = prescription.getReviewedBy() != null
                ? prescription.getReviewedBy().getFullName()
                : null;

        return new PrescriptionResponse(
                prescription.getId(),
                prescription.getProduct().getId(),
                prescription.getProduct().getName(),
                prescription.getStatus(),
                prescription.getOriginalFileName(),
                prescription.getUploadedAt(),
                reviewedByName,
                prescription.getReviewedAt()
        );
    }
}
