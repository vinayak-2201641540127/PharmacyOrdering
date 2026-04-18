package com.hcl.pharmacyordering.config;

import com.hcl.pharmacyordering.user.Role;
import com.hcl.pharmacyordering.user.UserAccount;
import com.hcl.pharmacyordering.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Locale;

@Component
@RequiredArgsConstructor
public class BootstrapAdminRunner implements ApplicationRunner {

    private final BootstrapAdminProperties bootstrapAdminProperties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(bootstrapAdminProperties.getEmail())
                || !StringUtils.hasText(bootstrapAdminProperties.getPassword())) {
            return;
        }

        String normalizedEmail = bootstrapAdminProperties.getEmail().trim().toLowerCase(Locale.ROOT);

        UserAccount admin = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> UserAccount.builder()
                        .email(normalizedEmail)
                        .build());

        admin.setFullName(bootstrapAdminProperties.getFullName().trim());
        admin.setPasswordHash(passwordEncoder.encode(bootstrapAdminProperties.getPassword()));
        admin.setRole(Role.ADMIN);

        userRepository.save(admin);
    }
}
