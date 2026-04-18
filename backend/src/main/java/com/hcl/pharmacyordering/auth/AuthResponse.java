package com.hcl.pharmacyordering.auth;

public record AuthResponse(
        String accessToken,
        UserSummaryResponse user
) {
}
