package com.hcl.pharmacyordering.prescription;

import com.hcl.pharmacyordering.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/prescriptions")
@RequiredArgsConstructor
public class AdminPrescriptionController {

    private final PrescriptionService prescriptionService;

    @GetMapping
    public List<PrescriptionResponse> getPendingPrescriptions() {
        return prescriptionService.findPending();
    }

    @PatchMapping("/{prescriptionId}")
    public PrescriptionResponse reviewPrescription(
            @AuthenticationPrincipal UserPrincipal reviewer,
            @PathVariable Long prescriptionId,
            @Valid @RequestBody ReviewPrescriptionRequest request
    ) {
        return prescriptionService.review(reviewer.id(), prescriptionId, request);
    }
}
