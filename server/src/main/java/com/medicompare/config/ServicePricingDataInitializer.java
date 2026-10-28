package com.medicompare.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ServicePricingDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        /*
         * Intentionally disabled.
         *
         * Existing service pricing data must never be modified
         * automatically when the application starts.
         *
         * Service prices are managed through the application's
         * normal admin/service management functionality.
         */
    }
}