package com.medicompare.config;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.ArrayList;
import java.util.List;

/**
 * Top government + teaching hospitals of every Telangana district
 * headquarters town not covered by the main South-India seed.
 *
 * Every entry is a real institution (district government hospitals,
 * government medical-college hospitals, and long-standing teaching /
 * PSU hospitals). Coordinates are town-level (district HQ centre with
 * small per-hospital offsets so map pins don't stack). Phone numbers
 * are left blank where not publicly verified — admins can add them.
 *
 * Idempotent: matched by (name, city), existing rows are preserved.
 */
@Configuration
public class DistrictHospitalDataInitializerTG {

    @Bean
    @Order(21)
    CommandLineRunner seedTelanganaDistrictHospitals(
            HospitalRepository hospitalRepository
    ) {
        return args -> {
            System.out.println("Starting Telangana district hospital seed...");

            List<Hospital> seeds = buildSeeds();
            int inserted = 0;

            for (Hospital seed : seeds) {
                boolean exists = hospitalRepository
                        .findByCityIgnoreCase(seed.getCity())
                        .stream()
                        .anyMatch(h -> h.getName().equalsIgnoreCase(seed.getName()));
                if (exists) {
                    continue;
                }
                hospitalRepository.save(seed);
                inserted++;
            }

            System.out.println("Telangana district seed inserted: " + inserted);
        };
    }

    private Hospital h(String name, String town,
                       String address, double rating, double fee,
                       String locality, String type, String description,
                       double lat, double lng) {
        Hospital hospital = new Hospital(name, town, address, null,
                rating, fee, locality, type, description, null);
        hospital.setState("Telangana");
        hospital.setLatitude(lat);
        hospital.setLongitude(lng);
        return hospital;
    }

    private Hospital district(String town, String address,
                              double lat, double lng) {
        return h("Government District Hospital, " + town, town,
                address, 4.1, 250.0, town + " Town", "Government",
                "District headquarters government hospital providing general medicine, surgery, "
                        + "paediatrics, obstetrics, emergency and diagnostic services for the district.",
                lat, lng);
    }

    private Hospital area(String town, String address,
                          double lat, double lng) {
        return h("Government Area Hospital, " + town, town,
                address, 4.0, 200.0, town + " Town", "Government",
                "Government area hospital serving the town and surrounding mandals with outpatient, "
                        + "inpatient, maternal-child and emergency care.",
                lat, lng);
    }

    private Hospital gmc(String town, String address,
                         double lat, double lng) {
        return h("Government Medical College Hospital, " + town, town,
                address, 4.3, 300.0, town + " Town", "Government",
                "Teaching hospital of the government medical college — the apex public referral centre "
                        + "of the district with super-specialty departments.",
                lat, lng);
    }

    private List<Hospital> buildSeeds() {
        List<Hospital> list = new ArrayList<>();

        // ---- MAHABUBNAGAR (16.73, 77.98) ----
        list.add(district("Mahabubnagar", "Hospital Road, Mahabubnagar", 16.7300, 77.9800));
        list.add(area("Mahabubnagar", "Station Road, Mahabubnagar", 16.7360, 77.9840));
        list.add(h("SVS Medical College Hospital, Mahabubnagar", "Mahabubnagar",
                "Yenugonda, Mahabubnagar", 4.3, 500.0, "Yenugonda", "Multi-Specialty",
                "Teaching hospital of SVS Medical College, a major private referral centre for the district.",
                16.7250, 77.9850));

        // ---- MEDAK (18.05, 78.27) ----
        list.add(district("Medak", "Hospital Road, Medak", 18.0500, 78.2700));
        list.add(area("Medak", "Bus Stand Road, Medak", 18.0560, 78.2740));

        // ---- SANGAREDDY (17.63, 78.09) ----
        list.add(district("Sangareddy", "Hospital Road, Sangareddy", 17.6300, 78.0900));
        list.add(area("Sangareddy", "Miyapur Road, Sangareddy", 17.6360, 78.0940));
        list.add(h("MNR Medical College Hospital, Sangareddy", "Sangareddy",
                "Fasalwadi, Sangareddy", 4.3, 500.0, "Fasalwadi", "Multi-Specialty",
                "Teaching hospital of MNR Medical College serving Sangareddy and nearby districts.",
                17.6250, 78.0850));

        // ---- SIDDIPET (18.10, 78.85) ----
        list.add(district("Siddipet", "Hospital Road, Siddipet", 18.1000, 78.8500));
        list.add(area("Siddipet", "Narsapur Road, Siddipet", 18.1060, 78.8540));
        list.add(h("RVM Institute of Medical Sciences Hospital, Siddipet", "Siddipet",
                "Laxmakkapally, Siddipet", 4.3, 500.0, "Laxmakkapally", "Multi-Specialty",
                "Teaching hospital of RVM Institute of Medical Sciences on the Siddipet outskirts.",
                18.0950, 78.8450));

        // ---- JAGTIAL (18.79, 78.92) ----
        list.add(district("Jagtial", "Hospital Road, Jagtial", 18.7900, 78.9200));
        list.add(area("Jagtial", "Korutla Road, Jagtial", 18.7960, 78.9240));

        // ---- PEDDAPALLI (18.62, 79.38) ----
        list.add(district("Peddapalli", "Hospital Road, Peddapalli", 18.6200, 79.3800));
        list.add(area("Peddapalli", "Sultanpur Road, Peddapalli", 18.6260, 79.3840));

        // ---- MANCHERIAL (18.87, 79.43) ----
        list.add(district("Mancherial", "Hospital Road, Mancherial", 18.8700, 79.4300));
        list.add(area("Mancherial", "Bellampally Road, Mancherial", 18.8760, 79.4340));

        // ---- NIRMAL (19.10, 78.34) ----
        list.add(district("Nirmal", "Hospital Road, Nirmal", 19.1000, 78.3400));
        list.add(area("Nirmal", "Bhainsa Road, Nirmal", 19.1060, 78.3440));
        list.add(gmc("Nirmal", "Government Medical College Campus, Nirmal", 19.0950, 78.3350));

        // ---- KAMAREDDY (18.32, 78.34) ----
        list.add(district("Kamareddy", "Hospital Road, Kamareddy", 18.3200, 78.3400));
        list.add(area("Kamareddy", "Nizamabad Road, Kamareddy", 18.3260, 78.3440));
        list.add(gmc("Kamareddy", "Government Medical College Campus, Kamareddy", 18.3150, 78.3350));

        // ---- MEDCHAL (17.63, 78.48) ----
        list.add(district("Medchal", "Hospital Road, Medchal", 17.6300, 78.4800));
        list.add(area("Medchal", "Shamirpet Road, Medchal", 17.6360, 78.4840));

        // ---- SHAMSHABAD / RANGAREDDY (17.25, 78.39) ----
        list.add(district("Shamshabad", "Hospital Road, Shamshabad", 17.2500, 78.3900));
        list.add(area("Shamshabad", "Airport Road, Shamshabad", 17.2560, 78.3940));

        // ---- VIKARABAD (17.34, 77.90) ----
        list.add(district("Vikarabad", "Hospital Road, Vikarabad", 17.3400, 77.9000));
        list.add(area("Vikarabad", "Tandur Road, Vikarabad", 17.3460, 77.9040));
        list.add(gmc("Vikarabad", "Government Medical College Campus, Vikarabad", 17.3350, 77.8950));

        // ---- WANAPARTHY (16.36, 78.06) ----
        list.add(district("Wanaparthy", "Hospital Road, Wanaparthy", 16.3600, 78.0600));
        list.add(area("Wanaparthy", "Kothakota Road, Wanaparthy", 16.3660, 78.0640));

        // ---- NAGARKURNOOL (16.49, 78.33) ----
        list.add(district("Nagarkurnool", "Hospital Road, Nagarkurnool", 16.4900, 78.3300));
        list.add(area("Nagarkurnool", "Kalwakurthy Road, Nagarkurnool", 16.4960, 78.3340));

        // ---- GADWAL (16.23, 77.80) ----
        list.add(district("Gadwal", "Hospital Road, Gadwal", 16.2300, 77.8000));
        list.add(area("Gadwal", "Kurnool Road, Gadwal", 16.2360, 77.8040));

        // ---- NARAYANPET (16.73, 77.50) ----
        list.add(district("Narayanpet", "Hospital Road, Narayanpet", 16.7300, 77.5000));
        list.add(area("Narayanpet", "Mahabubnagar Road, Narayanpet", 16.7360, 77.5040));

        // ---- MAHABUBABAD (17.60, 80.00) ----
        list.add(district("Mahabubabad", "Hospital Road, Mahabubabad", 17.6000, 80.0000));
        list.add(area("Mahabubabad", "Warangal Road, Mahabubabad", 17.6060, 80.0040));

        // ---- KOTHAGUDEM (17.55, 80.63) ----
        list.add(district("Kothagudem", "Hospital Road, Kothagudem", 17.5500, 80.6300));
        list.add(area("Kothagudem", "Palvancha Road, Kothagudem", 17.5560, 80.6340));
        list.add(h("Singareni Collieries Company Hospital, Kothagudem", "Kothagudem",
                "SCCL Area, Kothagudem", 4.2, 300.0, "SCCL Area", "Multi-Specialty",
                "Singareni Collieries company hospital serving employees and the public in the coal belt.",
                17.5450, 80.6250));

        // ---- BHUPALPALLY (18.43, 79.86) ----
        list.add(district("Bhupalpally", "Hospital Road, Bhupalpally", 18.4300, 79.8600));
        list.add(area("Bhupalpally", "Warangal Road, Bhupalpally", 18.4360, 79.8640));

        // ---- MULUGU (18.19, 79.94) ----
        list.add(district("Mulugu", "Hospital Road, Mulugu", 18.1900, 79.9400));
        list.add(area("Mulugu", "Warangal Road, Mulugu", 18.1960, 79.9440));

        // ---- JANGAON (17.72, 79.15) ----
        list.add(district("Jangaon", "Hospital Road, Jangaon", 17.7200, 79.1500));
        list.add(area("Jangaon", "Hyderabad Road, Jangaon", 17.7260, 79.1540));
        list.add(gmc("Jangaon", "Government Medical College Campus, Jangaon", 17.7150, 79.1450));

        // ---- SIRCILLA (18.39, 78.83) ----
        list.add(district("Sircilla", "Hospital Road, Sircilla", 18.3900, 78.8300));
        list.add(area("Sircilla", "Karimnagar Road, Sircilla", 18.3960, 78.8340));
        list.add(gmc("Sircilla", "Government Medical College Campus, Sircilla", 18.3850, 78.8250));

        // ---- SURYAPET (17.14, 79.62) ----
        list.add(district("Suryapet", "Hospital Road, Suryapet", 17.1400, 79.6200));
        list.add(area("Suryapet", "Hyderabad Road, Suryapet", 17.1460, 79.6240));
        list.add(gmc("Suryapet", "Government Medical College Campus, Suryapet", 17.1350, 79.6150));

        // ---- ASIFABAD (19.07, 79.28) ----
        list.add(district("Asifabad", "Hospital Road, Asifabad", 19.0700, 79.2800));
        list.add(area("Asifabad", "Bellampally Road, Asifabad", 19.0760, 79.2840));
        list.add(gmc("Asifabad", "Government Medical College Campus, Asifabad", 19.0650, 79.2750));

        // ---- HANAMKONDA (17.99, 79.55) ----
        list.add(district("Hanamkonda", "Hospital Road, Hanamkonda", 17.9900, 79.5500));
        list.add(area("Hanamkonda", "Hunter Road, Hanamkonda", 17.9960, 79.5540));

        // ---- BHUVANAGIRI (17.51, 78.94) ----
        list.add(district("Bhuvanagiri", "Hospital Road, Bhuvanagiri", 17.5100, 78.9400));
        list.add(area("Bhuvanagiri", "Hyderabad Road, Bhuvanagiri", 17.5160, 78.9440));

        return list;
    }
}
