package com.medicompare.config;

import com.medicompare.admin.entity.Admin;
import com.medicompare.admin.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private static final String ADMIN_NAME = "MediCompare Admin";
    private static final String ADMIN_ROLE = "ADMIN";

    @Value("${admin.default.email}")
    private String adminEmail;

    @Value("${admin.default.password}")
    private String adminPassword;

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDataInitializer(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        Admin admin = adminRepository
                .findByEmailIgnoreCase(adminEmail)
                .orElseGet(Admin::new);

        admin.setName(ADMIN_NAME);
        admin.setEmail(adminEmail);
        admin.setRole(ADMIN_ROLE);
        admin.setActive(true);

        /*
         * Always store a BCrypt hash.
         *
         * This also repairs an old admin record whose password
         * was stored using a different hash or plain text, by
         * re-encoding it whenever it doesn't already match.
         */
        boolean passwordNeedsUpdate =
                admin.getPassword() == null
                        || admin.getPassword().isEmpty()
                        || !passwordEncoder.matches(
                                adminPassword,
                                admin.getPassword()
                        );

        if (passwordNeedsUpdate) {
            admin.setPassword(
                    passwordEncoder.encode(adminPassword)
            );
        }

        adminRepository.save(admin);

        System.out.println();
        System.out.println("==============================================");
        System.out.println("MediCompare admin account ready");
        System.out.println("Email    : " + adminEmail);
        System.out.println("Role     : " + ADMIN_ROLE);
        System.out.println("==============================================");
        System.out.println();
    }
}