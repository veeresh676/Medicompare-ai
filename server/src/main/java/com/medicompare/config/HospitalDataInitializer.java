package com.medicompare.config;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.serviceentity.HospitalService;
import com.medicompare.serviceentity.HospitalServiceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class HospitalDataInitializer {

    @Bean
    CommandLineRunner seedHospitals(
            HospitalRepository hospitalRepository,
            HospitalServiceRepository hospitalServiceRepository
    ) {
        return args -> {

            System.out.println("Starting MediCompare hospital data check...");

            /*
             * ============================================================
             * STEP 1
             * Add the predefined hospitals that do not already exist.
             *
             * We DO NOT stop when the database already has 50+ hospitals.
             * Existing hospitals are preserved.
             * ============================================================
             */

            List<Hospital> seedHospitals = createHospitals();

            for (Hospital hospital : seedHospitals) {

                boolean alreadyExists =
                        hospitalRepository
                                .findByCityIgnoreCase(hospital.getCity())
                                .stream()
                                .anyMatch(existing ->
                                        existing.getName()
                                                .equalsIgnoreCase(
                                                        hospital.getName()
                                                )
                                );

                if (alreadyExists) {
                    continue;
                }

                hospitalRepository.save(hospital);
            }

            /*
             * ============================================================
             * STEP 2
             * Ensure EVERY hospital in the database has all 5 services.
             *
             * This also fixes the two original hospitals:
             *
             * MediCompare General Hospital
             * Andhra Hospitals
             *
             * without deleting them.
             * ============================================================
             */

            List<Hospital> allHospitals =
                    hospitalRepository.findAll();

            for (Hospital hospital : allHospitals) {

                createServicesForHospital(
                        hospital,
                        hospitalServiceRepository
                );
            }

            /*
             * ============================================================
             * STEP 3
             * Print final database totals.
             * ============================================================
             */

            long hospitalCount =
                    hospitalRepository.count();

            long serviceCount =
                    hospitalServiceRepository.count();

            System.out.println(
                    "Hospital data check completed."
            );

            System.out.println(
                    "Hospitals in database: "
                            + hospitalCount
            );

            System.out.println(
                    "Services in database: "
                            + serviceCount
            );
        };
    }


    private List<Hospital> createHospitals() {

        List<Hospital> hospitals =
                new ArrayList<>();

        /*
         * ============================================================
         * HYDERABAD — 5
         * ============================================================
         */

        hospitals.add(hospital(
                "MediCare Hyderabad Hospital",
                "Hyderabad",
                "Road No. 12, Banjara Hills",
                "040-40102001",
                4.7,
                650.0,
                "Banjara Hills",
                "Multi-Specialty",
                "A modern multi-specialty healthcare centre providing comprehensive medical care, diagnostics and specialist consultations.",
                null
        ));

        hospitals.add(hospital(
                "Sunrise Medical Centre",
                "Hyderabad",
                "Kondapur Main Road, Kondapur",
                "040-40102002",
                4.5,
                550.0,
                "Kondapur",
                "Multi-Specialty",
                "Patient-focused hospital offering specialist consultations, diagnostics and preventive healthcare services.",
                null
        ));

        hospitals.add(hospital(
                "LifePoint Specialty Hospital",
                "Hyderabad",
                "Hitech City Road, Madhapur",
                "040-40102003",
                4.6,
                750.0,
                "Madhapur",
                "Specialty",
                "Specialized healthcare facility focused on advanced consultations, diagnostics and coordinated patient care.",
                null
        ));

        hospitals.add(hospital(
                "MetroCare Medical Institute",
                "Hyderabad",
                "Kukatpally Housing Board Road",
                "040-40102004",
                4.3,
                450.0,
                "Kukatpally",
                "General Hospital",
                "Accessible general healthcare facility serving families with outpatient consultations and diagnostic services.",
                null
        ));

        hospitals.add(hospital(
                "WellSpring Hospital",
                "Hyderabad",
                "Dilsukhnagar Main Road",
                "040-40102005",
                4.4,
                500.0,
                "Dilsukhnagar",
                "Multi-Specialty",
                "Community-oriented hospital offering affordable specialist consultations and preventive healthcare.",
                null
        ));


        /*
         * ============================================================
         * BENGALURU — 5
         * ============================================================
         */

        hospitals.add(hospital(
                "Bengaluru HealthFirst Hospital",
                "Bengaluru",
                "100 Feet Road, Indiranagar",
                "080-40203001",
                4.8,
                700.0,
                "Indiranagar",
                "Multi-Specialty",
                "Contemporary healthcare centre providing specialist care, diagnostics and preventive medicine.",
                null
        ));

        hospitals.add(hospital(
                "GreenCity Medical Centre",
                "Bengaluru",
                "Outer Ring Road, Marathahalli",
                "080-40203002",
                4.5,
                600.0,
                "Marathahalli",
                "Multi-Specialty",
                "Comprehensive medical facility serving patients with modern outpatient and diagnostic services.",
                null
        ));

        hospitals.add(hospital(
                "PrimeCare Bengaluru",
                "Bengaluru",
                "Bannerghatta Road",
                "080-40203003",
                4.6,
                650.0,
                "Bannerghatta Road",
                "Specialty",
                "Specialist-focused healthcare centre with coordinated medical consultations and diagnostics.",
                null
        ));

        hospitals.add(hospital(
                "CityWell Hospital",
                "Bengaluru",
                "Whitefield Main Road",
                "080-40203004",
                4.2,
                450.0,
                "Whitefield",
                "General Hospital",
                "Family healthcare hospital providing general consultations, diagnostics and specialist referrals.",
                null
        ));

        hospitals.add(hospital(
                "CareBridge Medical Institute",
                "Bengaluru",
                "Koramangala 5th Block",
                "080-40203005",
                4.7,
                800.0,
                "Koramangala",
                "Multi-Specialty",
                "Modern healthcare institution designed around specialist access and convenient outpatient care.",
                null
        ));


        /*
         * ============================================================
         * CHENNAI — 4
         * ============================================================
         */

        hospitals.add(hospital(
                "Chennai Care Hospital",
                "Chennai",
                "Anna Salai, Teynampet",
                "044-40304001",
                4.6,
                600.0,
                "Teynampet",
                "Multi-Specialty",
                "Multi-specialty healthcare centre offering consultations, diagnostics and preventive healthcare.",
                null
        ));

        hospitals.add(hospital(
                "HarborView Medical Centre",
                "Chennai",
                "OMR, Sholinganallur",
                "044-40304002",
                4.4,
                500.0,
                "Sholinganallur",
                "General Hospital",
                "Accessible hospital providing general and specialist outpatient healthcare.",
                null
        ));

        hospitals.add(hospital(
                "WellLife Specialty Hospital",
                "Chennai",
                "Adyar Main Road",
                "044-40304003",
                4.7,
                750.0,
                "Adyar",
                "Specialty",
                "Specialty healthcare facility providing coordinated consultations and diagnostic support.",
                null
        ));

        hospitals.add(hospital(
                "BlueCross Medical Institute",
                "Chennai",
                "Velachery Main Road",
                "044-40304004",
                4.3,
                550.0,
                "Velachery",
                "Multi-Specialty",
                "Patient-centred hospital with a broad range of outpatient medical services.",
                null
        ));


        /*
         * ============================================================
         * MUMBAI — 4
         * ============================================================
         */

        hospitals.add(hospital(
                "Mumbai HealthPoint Hospital",
                "Mumbai",
                "Linking Road, Bandra West",
                "022-40405001",
                4.8,
                900.0,
                "Bandra West",
                "Multi-Specialty",
                "Premium multi-specialty healthcare centre with specialist consultations and diagnostics.",
                null
        ));

        hospitals.add(hospital(
                "HarborCare Hospital",
                "Mumbai",
                "Andheri East",
                "022-40405002",
                4.5,
                650.0,
                "Andheri East",
                "General Hospital",
                "Convenient healthcare facility offering general consultations and diagnostic services.",
                null
        ));

        hospitals.add(hospital(
                "PrimeLife Medical Centre",
                "Mumbai",
                "Powai Main Road",
                "022-40405003",
                4.6,
                750.0,
                "Powai",
                "Multi-Specialty",
                "Modern medical centre offering specialist care and preventive health services.",
                null
        ));

        hospitals.add(hospital(
                "CityPulse Specialty Hospital",
                "Mumbai",
                "Vashi Sector 17",
                "022-40405004",
                4.4,
                600.0,
                "Vashi",
                "Specialty",
                "Specialist healthcare facility serving patients across a range of outpatient specialties.",
                null
        ));


        /*
         * ============================================================
         * PUNE — 4
         * ============================================================
         */

        hospitals.add(hospital(
                "Pune Wellness Hospital",
                "Pune",
                "Baner Road, Baner",
                "020-40506001",
                4.7,
                600.0,
                "Baner",
                "Multi-Specialty",
                "Comprehensive healthcare centre providing specialist consultations and diagnostics.",
                null
        ));

        hospitals.add(hospital(
                "Deccan Medical Centre",
                "Pune",
                "FC Road, Shivajinagar",
                "020-40506002",
                4.4,
                500.0,
                "Shivajinagar",
                "General Hospital",
                "Accessible healthcare centre providing general medical services and specialist referrals.",
                null
        ));

        hospitals.add(hospital(
                "Pinnacle Specialty Hospital",
                "Pune",
                "Kharadi Bypass Road",
                "020-40506003",
                4.6,
                700.0,
                "Kharadi",
                "Specialty",
                "Specialized medical facility providing advanced consultations and diagnostic support.",
                null
        ));

        hospitals.add(hospital(
                "CareNest Hospital",
                "Pune",
                "Aundh Road",
                "020-40506004",
                4.5,
                550.0,
                "Aundh",
                "Multi-Specialty",
                "Family-oriented hospital offering a wide range of outpatient healthcare services.",
                null
        ));


        /*
         * ============================================================
         * DELHI — 4
         * ============================================================
         */

        hospitals.add(hospital(
                "CapitalCare Hospital",
                "Delhi",
                "Saket District Centre, Saket",
                "011-40607001",
                4.8,
                850.0,
                "Saket",
                "Multi-Specialty",
                "Comprehensive healthcare institution providing specialist consultations, diagnostics and preventive care.",
                null
        ));

        hospitals.add(hospital(
                "Delhi Wellness Centre",
                "Delhi",
                "Dwarka Sector 12",
                "011-40607002",
                4.5,
                550.0,
                "Dwarka",
                "General Hospital",
                "Community healthcare facility providing general consultations and diagnostic services.",
                null
        ));

        hospitals.add(hospital(
                "MetroLife Medical Institute",
                "Delhi",
                "Vikas Marg, Laxmi Nagar",
                "011-40607003",
                4.4,
                500.0,
                "Laxmi Nagar",
                "Multi-Specialty",
                "Modern healthcare centre offering specialist outpatient care and diagnostics.",
                null
        ));

        hospitals.add(hospital(
                "NorthStar Specialty Hospital",
                "Delhi",
                "Rohini Sector 10",
                "011-40607004",
                4.7,
                700.0,
                "Rohini",
                "Specialty",
                "Specialist healthcare facility focused on coordinated medical consultations.",
                null
        ));


        /*
         * ============================================================
         * VIJAYAWADA — 3
         * ============================================================
         */

        hospitals.add(hospital(
                "Krishna Health Hospital",
                "Vijayawada",
                "MG Road, Labbipet",
                "0866-40708001",
                4.6,
                450.0,
                "Labbipet",
                "Multi-Specialty",
                "Regional healthcare centre offering specialist consultations and diagnostic services.",
                null
        ));

        hospitals.add(hospital(
                "VijayaCare Medical Centre",
                "Vijayawada",
                "Benz Circle",
                "0866-40708002",
                4.4,
                400.0,
                "Benz Circle",
                "General Hospital",
                "Accessible hospital providing family healthcare and outpatient medical services.",
                null
        ));

        hospitals.add(hospital(
                "Amaravati Specialty Hospital",
                "Vijayawada",
                "Mangalagiri Road",
                "0866-40708003",
                4.7,
                600.0,
                "Mangalagiri Road",
                "Specialty",
                "Specialist healthcare centre providing consultations and coordinated diagnostics.",
                null
        ));


        /*
         * ============================================================
         * VISAKHAPATNAM — 3
         * ============================================================
         */

        hospitals.add(hospital(
                "CoastalCare Hospital",
                "Visakhapatnam",
                "MVP Colony",
                "0891-40809001",
                4.7,
                500.0,
                "MVP Colony",
                "Multi-Specialty",
                "Multi-specialty healthcare centre serving patients across coastal Andhra Pradesh.",
                null
        ));

        hospitals.add(hospital(
                "Vizag Wellness Medical Centre",
                "Visakhapatnam",
                "Dwaraka Nagar",
                "0891-40809002",
                4.5,
                450.0,
                "Dwaraka Nagar",
                "General Hospital",
                "Patient-friendly hospital providing general consultations and diagnostic support.",
                null
        ));

        hospitals.add(hospital(
                "Eastern Bay Specialty Hospital",
                "Visakhapatnam",
                "Seethammadhara",
                "0891-40809003",
                4.6,
                650.0,
                "Seethammadhara",
                "Specialty",
                "Specialist medical centre offering focused consultations and diagnostic services.",
                null
        ));


        /*
         * ============================================================
         * KOLKATA — 3
         * ============================================================
         */

        hospitals.add(hospital(
                "Kolkata Care Institute",
                "Kolkata",
                "EM Bypass, Kasba",
                "033-40910001",
                4.6,
                600.0,
                "Kasba",
                "Multi-Specialty",
                "Comprehensive hospital providing specialist consultations and diagnostic services.",
                null
        ));

        hospitals.add(hospital(
                "EastPoint Hospital",
                "Kolkata",
                "Salt Lake Sector V",
                "033-40910002",
                4.4,
                500.0,
                "Salt Lake",
                "General Hospital",
                "Modern general healthcare centre serving families and working professionals.",
                null
        ));

        hospitals.add(hospital(
                "Hooghly Specialty Centre",
                "Kolkata",
                "Rajarhat Main Road",
                "033-40910003",
                4.7,
                700.0,
                "Rajarhat",
                "Specialty",
                "Specialist healthcare facility providing coordinated outpatient medical services.",
                null
        ));


        /*
         * ============================================================
         * AHMEDABAD — 3
         * ============================================================
         */

        hospitals.add(hospital(
                "Ahmedabad HealthFirst",
                "Ahmedabad",
                "SG Highway",
                "079-41011001",
                4.7,
                600.0,
                "SG Highway",
                "Multi-Specialty",
                "Modern healthcare centre offering comprehensive specialist and diagnostic services.",
                null
        ));

        hospitals.add(hospital(
                "Sabarmati Medical Centre",
                "Ahmedabad",
                "Navrangpura",
                "079-41011002",
                4.4,
                450.0,
                "Navrangpura",
                "General Hospital",
                "Community healthcare centre offering general consultations and preventive care.",
                null
        ));

        hospitals.add(hospital(
                "Gujarat Specialty Hospital",
                "Ahmedabad",
                "Satellite Road",
                "079-41011003",
                4.6,
                650.0,
                "Satellite",
                "Specialty",
                "Specialist healthcare facility providing focused consultations and diagnostics.",
                null
        ));


        /*
         * ============================================================
         * JAIPUR — 3
         * ============================================================
         */

        hospitals.add(hospital(
                "PinkCity Medical Centre",
                "Jaipur",
                "Tonk Road",
                "0141-41112001",
                4.5,
                500.0,
                "Tonk Road",
                "Multi-Specialty",
                "Multi-specialty healthcare centre providing accessible consultations and diagnostics.",
                null
        ));

        hospitals.add(hospital(
                "Rajasthan HealthPoint",
                "Jaipur",
                "Vaishali Nagar",
                "0141-41112002",
                4.4,
                450.0,
                "Vaishali Nagar",
                "General Hospital",
                "Family-focused healthcare facility offering general and preventive medical services.",
                null
        ));

        hospitals.add(hospital(
                "Aravali Specialty Hospital",
                "Jaipur",
                "Malviya Nagar",
                "0141-41112003",
                4.7,
                650.0,
                "Malviya Nagar",
                "Specialty",
                "Specialist hospital providing coordinated outpatient consultations and diagnostics.",
                null
        ));


        /*
         * ============================================================
         * KOCHI — 2
         * ============================================================
         */

        hospitals.add(hospital(
                "Kerala Care Hospital",
                "Kochi",
                "MG Road, Ernakulam",
                "0484-41213001",
                4.7,
                600.0,
                "Ernakulam",
                "Multi-Specialty",
                "Comprehensive healthcare centre offering specialist consultations and preventive care.",
                null
        ));

        hospitals.add(hospital(
                "Backwater Medical Centre",
                "Kochi",
                "Vyttila Junction",
                "0484-41213002",
                4.5,
                500.0,
                "Vyttila",
                "General Hospital",
                "Patient-focused medical centre providing general consultations and diagnostics.",
                null
        ));


        /*
         * ============================================================
         * COIMBATORE — 2
         * ============================================================
         */

        hospitals.add(hospital(
                "Coimbatore Wellness Hospital",
                "Coimbatore",
                "Avinashi Road",
                "0422-41314001",
                4.6,
                550.0,
                "Avinashi Road",
                "Multi-Specialty",
                "Modern healthcare centre providing specialist consultations and diagnostics.",
                null
        ));

        hospitals.add(hospital(
                "Kovai Specialty Medical Centre",
                "Coimbatore",
                "RS Puram",
                "0422-41314002",
                4.5,
                600.0,
                "RS Puram",
                "Specialty",
                "Specialist medical centre focused on coordinated outpatient care.",
                null
        ));


        /*
         * ============================================================
         * LUCKNOW — 2
         * ============================================================
         */

        hospitals.add(hospital(
                "Lucknow HealthBridge Hospital",
                "Lucknow",
                "Gomti Nagar",
                "0522-41415001",
                4.6,
                500.0,
                "Gomti Nagar",
                "Multi-Specialty",
                "Comprehensive hospital offering specialist consultations and diagnostic services.",
                null
        ));

        hospitals.add(hospital(
                "Awadh Medical Centre",
                "Lucknow",
                "Hazratganj",
                "0522-41415002",
                4.4,
                450.0,
                "Hazratganj",
                "General Hospital",
                "Accessible family healthcare centre providing general consultations and diagnostics.",
                null
        ));


        /*
         * ============================================================
         * BHUBANESWAR — 2
         * ============================================================
         */

        hospitals.add(hospital(
                "Odisha Care Hospital",
                "Bhubaneswar",
                "Janpath Road",
                "0674-41516001",
                4.6,
                500.0,
                "Janpath",
                "Multi-Specialty",
                "Modern healthcare facility offering specialist consultations and preventive services.",
                null
        ));

        hospitals.add(hospital(
                "Kalinga Specialty Centre",
                "Bhubaneswar",
                "Patia Main Road",
                "0674-41516002",
                4.5,
                600.0,
                "Patia",
                "Specialty",
                "Specialist healthcare centre providing focused consultations and diagnostic support.",
                null
        ));

        return hospitals;
    }


    private Hospital hospital(
            String name,
            String city,
            String address,
            String phone,
            Double rating,
            Double consultationFee,
            String location,
            String hospitalType,
            String description,
            String imageUrl
    ) {

        return new Hospital(
                name,
                city,
                address,
                phone,
                rating,
                consultationFee,
                location,
                hospitalType,
                description,
                imageUrl
        );
    }


    /*
     * ============================================================
     * ENSURE FIVE SERVICES EXIST FOR EVERY HOSPITAL
     * ============================================================
     */

    private void createServicesForHospital(
            Hospital hospital,
            HospitalServiceRepository repository
    ) {

        createService(
                hospital,
                repository,
                "General Consultation",
                "Consultation with a general physician for common health concerns.",
                400,
                "General Medicine",
                30
        );

        createService(
                hospital,
                repository,
                "Cardiology Consultation",
                "Specialist consultation for heart and cardiovascular concerns.",
                900,
                "Cardiology",
                45
        );

        createService(
                hospital,
                repository,
                "Dermatology Consultation",
                "Specialist consultation for skin, hair and nail conditions.",
                700,
                "Dermatology",
                30
        );

        createService(
                hospital,
                repository,
                "Orthopedic Consultation",
                "Consultation for bones, joints, muscles and mobility-related concerns.",
                750,
                "Orthopedics",
                40
        );

        createService(
                hospital,
                repository,
                "Health Checkup",
                "Preventive health assessment with basic diagnostic screening.",
                1200,
                "Preventive Care",
                60
        );
    }


    private void createService(
            Hospital hospital,
            HospitalServiceRepository repository,
            String name,
            String description,
            double price,
            String category,
            int durationMinutes
    ) {

        /*
         * Prevent duplicate services.
         */

        if (repository.existsByHospitalIdAndNameIgnoreCase(
                hospital.getId(),
                name
        )) {
            return;
        }

        HospitalService service =
                new HospitalService();

        service.setHospital(hospital);
        service.setName(name);
        service.setDescription(description);
        service.setPrice(
                BigDecimal.valueOf(price)
        );
        service.setCategory(category);
        service.setDurationMinutes(
                durationMinutes
        );
        service.setAvailable(true);

        repository.save(service);
    }
}