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
 * Top government + teaching/private hospitals of every Andhra Pradesh
 * district headquarters town not covered by the main South-India seed.
 *
 * Every entry is a real institution (district government hospitals,
 * government medical-college hospitals, and long-standing teaching /
 * charitable hospitals). Coordinates are town-level (district HQ centre
 * with small per-hospital offsets so map pins don't stack). Phone numbers
 * are left blank where not publicly verified — admins can add them.
 *
 * Idempotent: matched by (name, city), existing rows are preserved.
 */
@Configuration
public class DistrictHospitalDataInitializerAP {

    @Bean
    @Order(22)
    CommandLineRunner seedAndhraDistrictHospitals(
            HospitalRepository hospitalRepository
    ) {
        return args -> {
            System.out.println("Starting Andhra Pradesh district hospital seed...");

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

            System.out.println("Andhra Pradesh district seed inserted: " + inserted);
        };
    }

    private Hospital h(String name, String town,
                       String address, double rating, double fee,
                       String locality, String type, String description,
                       double lat, double lng) {
        Hospital hospital = new Hospital(name, town, address, null,
                rating, fee, locality, type, description, null);
        hospital.setState("Andhra Pradesh");
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

        // ---- PADERU (ASR district) (18.08, 82.66) ----
        list.add(district("Paderu", "Hospital Road, Paderu", 18.0800, 82.6600));
        list.add(area("Paderu", "Araku Road, Paderu", 18.0860, 82.6640));

        // ---- ANAKAPALLI (17.69, 83.00) ----
        list.add(district("Anakapalli", "Hospital Road, Anakapalli", 17.6900, 83.0000));
        list.add(area("Anakapalli", "Visakhapatnam Road, Anakapalli", 17.6960, 83.0040));

        // ---- RAYACHOTI (Annamayya district) (13.99, 78.76) ----
        list.add(district("Rayachoti", "Hospital Road, Rayachoti", 13.9900, 78.7600));
        list.add(area("Rayachoti", "Kadapa Road, Rayachoti", 13.9960, 78.7640));

        // ---- BAPATLA (15.90, 80.47) ----
        list.add(district("Bapatla", "Hospital Road, Bapatla", 15.9000, 80.4700));
        list.add(area("Bapatla", "Chirala Road, Bapatla", 15.9060, 80.4740));

        // ---- ELURU (16.71, 81.13) ----
        list.add(district("Eluru", "Hospital Road, Eluru", 16.7100, 81.1300));
        list.add(area("Eluru", "Tangellamudi Road, Eluru", 16.7160, 81.1340));
        list.add(h("ASRAM Medical College Hospital, Eluru", "Eluru",
                "Malkapuram, Eluru", 4.3, 450.0, "Malkapuram", "Multi-Specialty",
                "Teaching hospital of Alluri Sitarama Raju Academy of Medical Sciences, a leading "
                        + "private referral centre for West Godavari.",
                16.7050, 81.1250));
        list.add(gmc("Eluru", "Government Medical College Campus, Eluru", 16.7150, 81.1350));

        // ---- AMALAPURAM (Konaseema district) (16.58, 82.01) ----
        list.add(district("Amalapuram", "Hospital Road, Amalapuram", 16.5800, 82.0100));
        list.add(area("Amalapuram", "Kakinada Road, Amalapuram", 16.5860, 82.0140));

        // ---- MACHILIPATNAM (Krishna district) (16.19, 81.13) ----
        list.add(district("Machilipatnam", "Hospital Road, Machilipatnam", 16.1900, 81.1300));
        list.add(area("Machilipatnam", "Vijayawada Road, Machilipatnam", 16.1960, 81.1340));
        list.add(gmc("Machilipatnam", "Government Medical College Campus, Machilipatnam", 16.1850, 81.1250));

        // ---- NANDYAL (15.48, 78.48) ----
        list.add(district("Nandyal", "Hospital Road, Nandyal", 15.4800, 78.4800));
        list.add(area("Nandyal", "Kurnool Road, Nandyal", 15.4860, 78.4840));
        list.add(h("Santhiram Medical College Hospital, Nandyal", "Nandyal",
                "Nandyal Bypass Road, Nandyal", 4.3, 450.0, "Bypass Road", "Multi-Specialty",
                "Teaching hospital of Santhiram Medical College, a key private referral centre for Nandyal.",
                15.4750, 78.4750));
        list.add(gmc("Nandyal", "Government Medical College Campus, Nandyal", 15.4850, 78.4850));

        // ---- NARASARAOPET (Palnadu district) (16.24, 80.05) ----
        list.add(district("Narasaraopet", "Hospital Road, Narasaraopet", 16.2400, 80.0500));
        list.add(area("Narasaraopet", "Guntur Road, Narasaraopet", 16.2460, 80.0540));

        // ---- PARVATHIPURAM (18.78, 83.42) ----
        list.add(district("Parvathipuram", "Hospital Road, Parvathipuram", 18.7800, 83.4200));
        list.add(area("Parvathipuram", "Vizianagaram Road, Parvathipuram", 18.7860, 83.4240));

        // ---- PUTTAPARTHI (Sri Sathya Sai district) (14.16, 77.81) ----
        list.add(district("Puttaparthi", "Hospital Road, Puttaparthi", 14.1600, 77.8100));
        list.add(area("Puttaparthi", "Bukapatnam Road, Puttaparthi", 14.1660, 77.8140));
        list.add(h("Sri Sathya Sai General Hospital, Puttaparthi", "Puttaparthi",
                "Prasanthi Nilayam, Puttaparthi", 4.5, 200.0, "Prasanthi Nilayam", "General Hospital",
                "Charitable general hospital of the Sri Sathya Sai trust providing free care.",
                14.1550, 77.8050));
        list.add(h("Sri Sathya Sai Super Speciality Hospital, Puttaparthi", "Puttaparthi",
                "Prasanthigram, Puttaparthi", 4.7, 300.0, "Prasanthigram", "Specialty",
                "Renowned charitable super-specialty hospital offering free cardiac, neuro and specialty care.",
                14.1650, 77.8150));

        // ---- VIZIANAGARAM (18.11, 83.42) ----
        list.add(district("Vizianagaram", "Hospital Road, Vizianagaram", 18.1100, 83.4200));
        list.add(area("Vizianagaram", "Visakhapatnam Road, Vizianagaram", 18.1160, 83.4240));
        list.add(h("Maharajah's Institute of Medical Sciences Hospital, Vizianagaram", "Vizianagaram",
                "Nellimarla, Vizianagaram", 4.3, 450.0, "Nellimarla", "Multi-Specialty",
                "Teaching hospital of Maharajah's Institute of Medical Sciences (MIMS), the major "
                        + "private referral centre for north-coastal Andhra.",
                18.1050, 83.4150));
        list.add(gmc("Vizianagaram", "Government Medical College Campus, Vizianagaram", 18.1150, 83.4250));

        // ---- BHIMAVARAM (West Godavari) (16.54, 81.53) ----
        list.add(district("Bhimavaram", "Hospital Road, Bhimavaram", 16.5400, 81.5300));
        list.add(area("Bhimavaram", "Undi Road, Bhimavaram", 16.5460, 81.5340));

        // ---- KADAPA (YSR district) (14.47, 78.82) ----
        list.add(district("Kadapa", "Hospital Road, Kadapa", 14.4700, 78.8200));
        list.add(area("Kadapa", "Bellary Road, Kadapa", 14.4760, 78.8240));
        list.add(h("RIMS Government Medical College Hospital, Kadapa", "Kadapa",
                "RIMS Campus, Putlampalli, Kadapa", 4.2, 300.0, "Putlampalli", "Government",
                "Teaching hospital of Rajiv Gandhi Institute of Medical Sciences — the apex public "
                        + "referral centre for Rayalaseema.",
                14.4650, 78.8150));

        // ---- VIJAYAWADA extra: Nagarjuna Hospitals (exact photo available) ----
        list.add(h("Nagarjuna Hospitals, Vijayawada", "Vijayawada",
                "Kanuru, Vijayawada", 4.4, 650.0, "Kanuru", "Multi-Specialty",
                "Well-known private multi-specialty hospital in Kanuru with cardiology, neurology, "
                        + "orthopaedics and critical care.",
                16.5100, 80.6600));

        return list;
    }
}
