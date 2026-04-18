package com.hcl.pharmacyordering.prescription;

import com.hcl.pharmacyordering.config.StorageProperties;
import com.hcl.pharmacyordering.exception.BusinessRuleViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            MediaType.APPLICATION_PDF_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_JPEG_VALUE
    );

    private final StorageProperties storageProperties;

    public StoredPrescriptionFile storePrescription(MultipartFile file, Long userId) {
        if (file.isEmpty()) {
            throw new BusinessRuleViolationException("Uploaded prescription file must not be empty.");
        }

        String contentType = Optional.ofNullable(file.getContentType()).orElse("");

        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessRuleViolationException("Only PDF, PNG, and JPEG prescription files are allowed.");
        }

        String originalFileName = Optional.ofNullable(file.getOriginalFilename()).orElse("prescription");
        String sanitizedName = StringUtils.cleanPath(originalFileName).replace("..", "");

        try {
            Path rootDirectory = Path.of(storageProperties.getPrescriptionsDir()).toAbsolutePath().normalize();
            Files.createDirectories(rootDirectory);

            Path userDirectory = rootDirectory.resolve(userId.toString()).normalize();
            Files.createDirectories(userDirectory);

            String generatedFileName = UUID.randomUUID() + "-" + sanitizedName;
            Path targetFile = userDirectory.resolve(generatedFileName).normalize();

            if (!targetFile.startsWith(rootDirectory)) {
                throw new BusinessRuleViolationException("Invalid prescription file path.");
            }

            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }

            String relativeStoragePath = rootDirectory.relativize(targetFile).toString().replace('\\', '/');

            return new StoredPrescriptionFile(
                    sanitizedName,
                    relativeStoragePath,
                    contentType,
                    file.getSize()
            );
        } catch (IOException exception) {
            throw new BusinessRuleViolationException("Unable to store the prescription file.");
        }
    }
}
