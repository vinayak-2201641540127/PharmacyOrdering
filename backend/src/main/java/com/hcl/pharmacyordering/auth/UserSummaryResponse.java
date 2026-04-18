package com.hcl.pharmacyordering.auth;

import com.hcl.pharmacyordering.user.Role;

public record UserSummaryResponse(
        Long id,
        String fullName,
        String email,
        Role role
) {
}
