package com.hcl.pharmacyordering.auth;

import com.hcl.pharmacyordering.exception.BusinessRuleViolationException;
import com.hcl.pharmacyordering.security.JwtService;
import com.hcl.pharmacyordering.user.Role;
import com.hcl.pharmacyordering.user.UserAccount;
import com.hcl.pharmacyordering.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessRuleViolationException("An account with this email already exists.");
        }

        UserAccount user = UserAccount.builder()
                .fullName(request.fullName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.CUSTOMER)
                .build();

        UserAccount savedUser = userRepository.save(user);
        return toAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        UserAccount user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(UserAccount user) {
        UserSummaryResponse userSummary = new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
        return new AuthResponse(jwtService.generateToken(user), userSummary);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
