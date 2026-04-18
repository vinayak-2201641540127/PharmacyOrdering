package com.hcl.pharmacyordering.prescription;

import com.hcl.pharmacyordering.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public PrescriptionResponse uploadPrescription(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestPart("productId") Long productId,
            @RequestPart("file") MultipartFile file
    ) {
        return prescriptionService.upload(user.id(), productId, file);
    }

    @GetMapping("/my")
    public List<PrescriptionResponse> getMyPrescriptions(@AuthenticationPrincipal UserPrincipal user) {
        return prescriptionService.findMine(user.id());
    }
}
