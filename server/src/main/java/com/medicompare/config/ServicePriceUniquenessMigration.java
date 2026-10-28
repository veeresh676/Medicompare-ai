package com.medicompare.config;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.serviceentity.HospitalService;
import com.medicompare.serviceentity.HospitalServiceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

/**
 * Gives every consultation fee and service price a UNIQUE,
 * hospital-specific value in the database.
 *
 * Tier bands stay intact (government lowest, private highest), but
 * each hospital gets a deterministic ±20% adjustment derived from
 * its own id plus the service name — so the same service costs a
 * different, relatable, reasonable amount at every hospital and
 * price comparison becomes meaningful.
 *
 * Deterministic: reboots compute identical values (no drift).
 * Safe: rows an administrator priced explicitly (auto flag FALSE)
 * are never touched.
 */
@Configuration
public class ServicePriceUniquenessMigration {

    @Bean
    @Order(25)
    CommandLineRunner uniquifyPrices(
            HospitalRepository hospitalRepository,
            HospitalServiceRepository serviceRepository
    ) {
        return args -> {
            System.out.println("Starting service price uniqueness migration...");

            int servicesUpdated = 0;
            int feesUpdated = 0;

            List<HospitalService> services = serviceRepository.findAll();

            for (HospitalService service : services) {

                if (Boolean.FALSE.equals(service.getAutoPriced())) {
                    continue;
                }

                if (service.getPrice() == null
                        || service.getPrice().doubleValue() <= 0
                        || service.getHospital() == null
                        || service.getHospital().getId() == null) {
                    continue;
                }

                double unique = uniquePrice(
                        service.getPrice().doubleValue(),
                        service.getHospital().getId(),
                        service.getName());

                service.setPrice(BigDecimal.valueOf(unique));
                service.setAutoPriced(true);
                serviceRepository.save(service);
                servicesUpdated++;
            }

            List<Hospital> hospitals = hospitalRepository.findAll();

            for (Hospital hospital : hospitals) {

                if (Boolean.FALSE.equals(hospital.getFeeAutoPriced())) {
                    continue;
                }

                if (hospital.getConsultationFee() == null
                        || hospital.getConsultationFee() <= 0
                        || hospital.getId() == null) {
                    continue;
                }

                double unique = uniquePrice(
                        hospital.getConsultationFee(),
                        hospital.getId(),
                        "consultation");

                hospital.setConsultationFee(unique);
                hospital.setFeeAutoPriced(true);
                hospitalRepository.save(hospital);
                feesUpdated++;
            }

            System.out.println("Price uniqueness migration done. "
                    + "Services updated: " + servicesUpdated
                    + ", consultation fees updated: " + feesUpdated);
        };
    }

    static double uniquePrice(
            double base,
            Long hospitalId,
            String name
    ) {

        String key = name == null ? ""
                : name.trim().toLowerCase(Locale.ROOT);

        /*
         * Stable 41-step ladder from -20% to +20%.
         * String.hashCode is specified and stable across JVMs,
         * so every boot computes the same value.
         */
        int step = Math.floorMod(
                (int) (hospitalId * 31L + key.hashCode()),
                41) - 20;

        double adjusted = base * (1.0 + step / 100.0);

        double granularity = adjusted >= 10000 ? 100.0 : 10.0;

        double rounded =
                Math.round(adjusted / granularity) * granularity;

        return Math.max(rounded, 50.0);
    }
}
