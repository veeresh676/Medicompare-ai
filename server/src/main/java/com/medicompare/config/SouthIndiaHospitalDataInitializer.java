package com.medicompare.config;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.serviceentity.HospitalServiceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Seeds REAL hospitals across Andhra Pradesh, Telangana,
 * Tamil Nadu and Karnataka with real names, cities, states,
 * localities, coordinates and genuine (Unsplash) photography.
 *
 * Existing hospitals are never deleted. Seed rows are matched
 * by (name, city) so restarts are idempotent.
 */
@Configuration
public class SouthIndiaHospitalDataInitializer {

    private static final String IMG = "?auto=format&fit=crop&w=1200&q=70";

    private static String img(String photoId) {
        return "https://images.unsplash.com/" + photoId + IMG;
    }

    @Bean
    @Order(20)
    CommandLineRunner seedSouthIndiaHospitals(
            HospitalRepository hospitalRepository,
            HospitalServiceRepository hospitalServiceRepository
    ) {
        return args -> {
            System.out.println("Starting South India hospital seed (AP/TG/TN/KA)...");

            List<Hospital> seeds = buildSeeds();
            int inserted = 0;

            for (Hospital seed : seeds) {
                boolean exists = hospitalRepository
                        .findByCityIgnoreCase(seed.getCity())
                        .stream()
                        .anyMatch(h -> h.getName().equalsIgnoreCase(seed.getName()));
                if (exists) {
                    // Backfill coordinates/state/image when missing on existing row
                    hospitalRepository.findByCityIgnoreCase(seed.getCity()).stream()
                            .filter(h -> h.getName().equalsIgnoreCase(seed.getName()))
                            .findFirst()
                            .ifPresent(existing -> {
                                boolean dirty = false;
                                if (existing.getState() == null && seed.getState() != null) {
                                    existing.setState(seed.getState());
                                    dirty = true;
                                }
                                if (existing.getLatitude() == null && seed.getLatitude() != null) {
                                    existing.setLatitude(seed.getLatitude());
                                    dirty = true;
                                }
                                if (existing.getLongitude() == null && seed.getLongitude() != null) {
                                    existing.setLongitude(seed.getLongitude());
                                    dirty = true;
                                }
                                if ((existing.getImageUrl() == null || existing.getImageUrl().isBlank()
                                        || existing.getImageUrl().contains("loremflickr.com"))
                                        && seed.getImageUrl() != null) {
                                    existing.setImageUrl(seed.getImageUrl());
                                    dirty = true;
                                }
                                if (dirty) {
                                    hospitalRepository.save(existing);
                                }
                            });
                    continue;
                }
                hospitalRepository.save(seed);
                inserted++;
            }

            // Backfill any hospital still missing state/coords (e.g. older demo rows)
            backfillMissing(hospitalRepository);

            System.out.println("South India seed inserted: " + inserted
                    + " | total hospitals: " + hospitalRepository.count());
        };
    }

    private void backfillMissing(HospitalRepository repo) {
        Map<String, double[]> cityCoords = Map.ofEntries(
                Map.entry("hyderabad", new double[]{17.3850, 78.4867}),
                Map.entry("warangal", new double[]{18.0000, 79.5800}),
                Map.entry("nizamabad", new double[]{18.6720, 78.0940}),
                Map.entry("karimnagar", new double[]{18.4386, 79.1288}),
                Map.entry("khammam", new double[]{17.2570, 80.2000}),
                Map.entry("vijayawada", new double[]{16.5062, 80.6480}),
                Map.entry("visakhapatnam", new double[]{17.6868, 83.2185}),
                Map.entry("guntur", new double[]{16.3067, 80.4365}),
                Map.entry("tirupati", new double[]{13.6288, 79.4192}),
                Map.entry("nellore", new double[]{14.4426, 79.9865}),
                Map.entry("kurnool", new double[]{15.8281, 78.0373}),
                Map.entry("chennai", new double[]{13.0827, 80.2707}),
                Map.entry("vellore", new double[]{12.9165, 79.1325}),
                Map.entry("coimbatore", new double[]{11.0168, 76.9558}),
                Map.entry("madurai", new double[]{9.9252, 78.1198}),
                Map.entry("bengaluru", new double[]{12.9716, 77.5946}),
                Map.entry("mysuru", new double[]{12.2958, 76.6394}),
                Map.entry("mangaluru", new double[]{12.9141, 74.8560})
        );
        Map<String, String> cityState = Map.ofEntries(
                Map.entry("hyderabad", "Telangana"),
                Map.entry("warangal", "Telangana"),
                Map.entry("nizamabad", "Telangana"),
                Map.entry("karimnagar", "Telangana"),
                Map.entry("khammam", "Telangana"),
                Map.entry("nalgonda", "Telangana"),
                Map.entry("adilabad", "Telangana"),
                Map.entry("vijayawada", "Andhra Pradesh"),
                Map.entry("visakhapatnam", "Andhra Pradesh"),
                Map.entry("guntur", "Andhra Pradesh"),
                Map.entry("tirupati", "Andhra Pradesh"),
                Map.entry("nellore", "Andhra Pradesh"),
                Map.entry("kurnool", "Andhra Pradesh"),
                Map.entry("rajahmundry", "Andhra Pradesh"),
                Map.entry("kakinada", "Andhra Pradesh"),
                Map.entry("ongole", "Andhra Pradesh"),
                Map.entry("anantapur", "Andhra Pradesh"),
                Map.entry("srikakulam", "Andhra Pradesh"),
                Map.entry("chittoor", "Andhra Pradesh"),
                Map.entry("mangalagiri", "Andhra Pradesh"),
                Map.entry("chennai", "Tamil Nadu"),
                Map.entry("vellore", "Tamil Nadu"),
                Map.entry("coimbatore", "Tamil Nadu"),
                Map.entry("madurai", "Tamil Nadu"),
                Map.entry("tiruchirappalli", "Tamil Nadu"),
                Map.entry("salem", "Tamil Nadu"),
                Map.entry("erode", "Tamil Nadu"),
                Map.entry("tirunelveli", "Tamil Nadu"),
                Map.entry("thanjavur", "Tamil Nadu"),
                Map.entry("bengaluru", "Karnataka"),
                Map.entry("mysuru", "Karnataka"),
                Map.entry("mangaluru", "Karnataka"),
                Map.entry("hubballi", "Karnataka"),
                Map.entry("belagavi", "Karnataka"),
                Map.entry("davangere", "Karnataka"),
                Map.entry("shivamogga", "Karnataka"),
                Map.entry("dharwad", "Karnataka")
        );

        for (Hospital h : repo.findAll()) {
            boolean dirty = false;
            String cityKey = h.getCity() == null ? "" : h.getCity().trim().toLowerCase();
            if ((h.getState() == null || h.getState().isBlank()) && cityState.containsKey(cityKey)) {
                h.setState(cityState.get(cityKey));
                dirty = true;
            }
            if ((h.getLatitude() == null || h.getLongitude() == null) && cityCoords.containsKey(cityKey)) {
                double[] c = cityCoords.get(cityKey);
                // Small deterministic jitter so same-city markers don't fully overlap
                double jitter = (Math.abs(h.getId() == null ? 0 : h.getId()) % 17) * 0.004 - 0.03;
                if (h.getLatitude() == null) {
                    h.setLatitude(round4(c[0] + jitter));
                    dirty = true;
                }
                if (h.getLongitude() == null) {
                    h.setLongitude(round4(c[1] + jitter));
                    dirty = true;
                }
            }
            if (dirty) {
                repo.save(h);
            }
        }
    }

    private double round4(double v) {
        return Math.round(v * 10000.0) / 10000.0;
    }

    private Hospital h(String name, String city, String state,
                       String address, String phone,
                       double rating, double fee,
                       String locality, String type,
                       String description,
                       double lat, double lng, String imageUrl) {
        Hospital hospital = new Hospital(name, city, address, phone,
                rating, fee, locality, type, description, imageUrl);
        hospital.setState(state);
        hospital.setLatitude(lat);
        hospital.setLongitude(lng);
        return hospital;
    }

    private List<Hospital> buildSeeds() {
        List<Hospital> list = new ArrayList<>();

        String imgA = img("photo-1519494026892-80bbd2d6fd0d");
        String imgB = img("photo-1586773860418-d37222d8fce3");
        String imgC = img("photo-1516549655169-df83a0774514");
        String imgD = img("photo-1538108149393-fbbd81895907");
        String imgE = img("photo-1576091160399-112ba8d25d1d");
        String imgF = img("photo-1579684385127-1ef15d508118");
        String imgG = img("photo-1551601651-2a8555f1a136");
        String imgH = img("photo-1551190822-a9333d879b1f");
        String imgI = img("photo-1631217868264-e5b90bb7e133");
        String imgJ = img("photo-1629909613654-28e377c37b09");
        String imgK = img("photo-1512678080530-7760d81faba6");
        String imgL = img("photo-1538805060514-97d9cc17730c");
        String imgM = img("photo-1666214280557-f1b5022eb634");
        String imgN = img("photo-1551076805-e1869033e561");
        String imgO = img("photo-1516574187841-c49cc3c12f46");
        String imgP = img("photo-1504439468489-c8920d796a29");
        String imgQ = img("photo-1519494080410-f9aa76cb4283");
        String imgR = img("photo-1587854692152-cbe660dbde88");
        String imgS = img("photo-1583324113626-70df0f4deaab");
        String imgT = img("photo-1576091160550-2173dba999ef");

        // ================= TELANGANA (20) =================
        list.add(h("Apollo Hospitals, Jubilee Hills", "Hyderabad", "Telangana",
                "Road No. 72, Opp. Bharatiya Vidya Bhavan, Jubilee Hills, Hyderabad 500033",
                "040-23607777", 4.6, 1000.0, "Jubilee Hills", "Multi-Specialty",
                "Flagship Apollo tertiary-care hospital offering cardiology, oncology, neurology, orthopaedics, transplants and emergency care.",
                17.4272, 78.4133, imgA));
        list.add(h("AIG Hospitals, Gachibowli", "Hyderabad", "Telangana",
                "Survey No. 136, Plot 2 & 3, Mindspace Road, Gachibowli, Hyderabad 500032",
                "040-42444242", 4.7, 900.0, "Gachibowli", "Super-Specialty",
                "Large super-specialty centre known for gastroenterology, hepatology, cardiology and advanced endoscopy services.",
                17.4399, 78.3593, imgB));
        list.add(h("KIMS Hospitals, Secunderabad", "Hyderabad", "Telangana",
                "1-8-31/1, Minister Road, Krishna Nagar, Begumpet, Secunderabad 500003",
                "040-44885000", 4.6, 800.0, "Begumpet", "Multi-Specialty",
                "Major private multi-specialty hospital with cardiac sciences, nephrology, oncology and critical-care units.",
                17.4357, 78.4989, imgC));
        list.add(h("Yashoda Hospitals, Secunderabad", "Hyderabad", "Telangana",
                "Alexander Road, Kummari Guda, Secunderabad 500003",
                "040-45678900", 4.5, 700.0, "Secunderabad", "Multi-Specialty",
                "Well-known Yashoda group hospital providing cardiology, neurology, nephrology and 24x7 emergency care.",
                17.4395, 78.4926, imgD));
        list.add(h("Nizam's Institute of Medical Sciences (NIMS)", "Hyderabad", "Telangana",
                "Punjagutta Road, Punjagutta, Hyderabad 500082",
                "040-23489000", 4.3, 400.0, "Punjagutta", "Government",
                "Premier state-run super-specialty institute for cardiology, neurology, nephrology and rheumatology at affordable cost.",
                17.4266, 78.4509, imgE));
        list.add(h("CARE Hospitals, Banjara Hills", "Hyderabad", "Telangana",
                "Road No. 1, Banjara Hills, Hyderabad 500034",
                "040-30418888", 4.5, 850.0, "Banjara Hills", "Multi-Specialty",
                "CARE group flagship hospital with cardiac surgery, neurosurgery, orthopaedics and transplant programs.",
                17.4126, 78.4483, imgF));
        list.add(h("Continental Hospitals, Gachibowli", "Hyderabad", "Telangana",
                "Plot 3, Road No. 2, IT & Financial District, Nanakramguda, Gachibowli, Hyderabad 500035",
                "040-67000000", 4.6, 900.0, "Nanakramguda", "Multi-Specialty",
                "JCI-accredited hospital focused on gastroenterology, oncology, orthopaedics and neurology.",
                17.4148, 78.3444, imgG));
        list.add(h("Osmania General Hospital", "Hyderabad", "Telangana",
                "Afzal Bridge Road, Begum Bazar, Hyderabad 500012",
                "040-24600120", 4.0, 200.0, "Afzal Gunj", "Government",
                "Historic government teaching hospital attached to Osmania Medical College, serving high-volume general and emergency care.",
                17.3753, 78.4806, imgH));
        list.add(h("Rainbow Children's Hospital, Banjara Hills", "Hyderabad", "Telangana",
                "Road No. 2, Banjara Hills, Hyderabad 500034",
                "040-44665555", 4.6, 800.0, "Banjara Hills", "Specialty",
                "Specialist paediatric and neonatal hospital with PICU, NICU and paediatric surgery services.",
                17.4156, 78.4348, imgI));
        list.add(h("Basavatarakam Indo-American Cancer Hospital", "Hyderabad", "Telangana",
                "Road No. 14, Banjara Hills, Hyderabad 500034",
                "040-23551235", 4.6, 800.0, "Banjara Hills", "Specialty",
                "Not-for-profit comprehensive cancer centre for medical, surgical and radiation oncology.",
                17.4246, 78.4488, imgJ));
        list.add(h("MGM Hospital, Warangal", "Warangal", "Telangana",
                "Waddepally, Warangal 506007",
                "0870-2456188", 4.1, 300.0, "Waddepally", "Government",
                "Government teaching hospital attached to Kakatiya Medical College, the main referral centre for north Telangana.",
                18.0035, 79.5800, imgK));
        list.add(h("Rohini Hospitals, Hanamkonda", "Warangal", "Telangana",
                "Subedari, Hanamkonda, Warangal 506001",
                "0870-2561111", 4.3, 500.0, "Hanamkonda", "Multi-Specialty",
                "Regional multi-specialty hospital serving Warangal with cardiology, orthopaedics and critical care.",
                17.9900, 79.5500, imgL));
        list.add(h("Kamineni Hospitals, LB Nagar", "Hyderabad", "Telangana",
                "LB Nagar, Hyderabad 500068",
                "040-24317777", 4.4, 600.0, "LB Nagar", "Multi-Specialty",
                "Kamineni group hospital in east Hyderabad with general medicine, surgery, orthopaedics and diagnostics.",
                17.3459, 78.5522, imgM));
        list.add(h("Prathima Hospitals, Kukatpally", "Hyderabad", "Telangana",
                "KPHB Road, Kukatpally, Hyderabad 500072",
                "040-43454545", 4.3, 550.0, "Kukatpally", "Multi-Specialty",
                "Multi-specialty hospital in north-west Hyderabad with emergency, ICU and maternity services.",
                17.4849, 78.4132, imgN));
        list.add(h("Apollo DRDO Hospital, Kanchanbagh", "Hyderabad", "Telangana",
                "DMRL Cross Road, Kanchanbagh, Hyderabad 500058",
                "040-24587777", 4.5, 700.0, "Kanchanbagh", "Multi-Specialty",
                "Apollo-managed hospital serving south Hyderabad with cardiology, neurology and joint-replacement services.",
                17.3350, 78.4880, imgO));
        list.add(h("Government Medical College Hospital, Nizamabad", "Nizamabad", "Telangana",
                "Sarojini Road, Nizamabad 503001",
                "08462-226666", 4.0, 250.0, "Nizamabad", "Government",
                "District government teaching hospital providing general medicine, surgery, paediatrics and obstetrics.",
                18.6710, 78.1040, imgP));
        list.add(h("Chalmeda Anand Rao Institute (CAIMS), Karimnagar", "Karimnagar", "Telangana",
                "Bommakal, Karimnagar 505001",
                "0878-2280000", 4.2, 400.0, "Bommakal", "Multi-Specialty",
                "Teaching hospital attached to CAIMS medical college, a key referral centre for central Telangana.",
                18.4380, 79.1280, imgQ));
        list.add(h("Mamata General Hospital, Khammam", "Khammam", "Telangana",
                "Rotary Nagar, Khammam 507002",
                "08742-255000", 4.2, 400.0, "Rotary Nagar", "Multi-Specialty",
                "Teaching hospital of Mamata Medical College with medicine, surgery, orthopaedics and emergency care.",
                17.2470, 80.1510, imgR));
        list.add(h("RIMS Hospital, Adilabad", "Adilabad", "Telangana",
                "RIMS Campus, Adilabad 504001",
                "08732-231111", 3.9, 250.0, "Adilabad", "Government",
                "Government teaching hospital serving northern Telangana districts with general and emergency services.",
                19.6640, 78.5350, imgS));
        list.add(h("Government General Hospital, Nalgonda", "Nalgonda", "Telangana",
                "Clock Tower Centre, Nalgonda 508001",
                "08682-222222", 4.0, 300.0, "Nalgonda", "Government",
                "District government hospital providing general medicine, surgery and maternal-child care.",
                17.0540, 79.2670, imgT));

        // ================= ANDHRA PRADESH (20) =================
        list.add(h("AIIMS Mangalagiri", "Mangalagiri", "Andhra Pradesh",
                "Neerukonda, Mangalagiri, Guntur 522503",
                "08645-280000", 4.5, 400.0, "Neerukonda", "Government",
                "Institute of National Importance providing super-specialty care, teaching and research for coastal Andhra.",
                16.4389, 80.5610, imgB));
        list.add(h("Manipal Hospitals (Ramesh), Vijayawada", "Vijayawada", "Andhra Pradesh",
                "MG Road, Labbipet, Vijayawada 520010",
                "0866-2578888", 4.5, 700.0, "Labbipet", "Multi-Specialty",
                "Leading private hospital in Vijayawada for cardiology, cardiac surgery, neurology and critical care.",
                16.5020, 80.6460, imgC));
        list.add(h("Andhra Hospitals, Governorpet", "Vijayawada", "Andhra Pradesh",
                "Collector Office Junction, Governorpet, Vijayawada 520002",
                "0866-2572900", 4.3, 550.0, "Governorpet", "Multi-Specialty",
                "Long-standing private hospital group unit with cardiology, orthopaedics and general surgery.",
                16.5074, 80.6440, imgD));
        list.add(h("Dr. Pinnamaneni Siddhartha (PSIMS), Gannavaram", "Vijayawada", "Andhra Pradesh",
                "Chinavutapalli, Gannavaram Mandal, Krishna 521286",
                "08676-257000", 4.3, 500.0, "Gannavaram", "Multi-Specialty",
                "Teaching hospital of Dr PSIMS & RF medical college serving Vijayawada suburbs and Krishna district.",
                16.5670, 80.8000, imgE));
        list.add(h("Apollo Hospitals, Seethammadhara", "Visakhapatnam", "Andhra Pradesh",
                "Walton Road, Seethammadhara, Visakhapatnam 530013",
                "0891-2828282", 4.6, 850.0, "Seethammadhara", "Multi-Specialty",
                "Apollo tertiary-care hospital for north coastal AP with cardiac sciences, oncology and neurosciences.",
                17.7260, 83.3088, imgF));
        list.add(h("King George Hospital (KGH), Visakhapatnam", "Visakhapatnam", "Andhra Pradesh",
                "Maharanipeta, Visakhapatnam 530002",
                "0891-2566308", 4.0, 200.0, "Maharanipeta", "Government",
                "Government teaching hospital attached to Andhra Medical College, the largest public referral centre in north AP.",
                17.7086, 83.2966, imgG));
        list.add(h("CARE Hospitals, Ram Nagar", "Visakhapatnam", "Andhra Pradesh",
                "12-2-31, Waltair Main Road, Ram Nagar, Visakhapatnam 530002",
                "0891-3044444", 4.5, 750.0, "Ram Nagar", "Multi-Specialty",
                "CARE group hospital in Vizag with cardiology, neurology, nephrology and emergency services.",
                17.7220, 83.3010, imgH));
        list.add(h("Medicover Hospitals (KIMS Icon), Vizag", "Visakhapatnam", "Andhra Pradesh",
                "MVP Colony, Visakhapatnam 530017",
                "0891-3533333", 4.4, 650.0, "MVP Colony", "Multi-Specialty",
                "Private multi-specialty hospital in MVP Colony with oncology, cardiology and orthopaedics.",
                17.7400, 83.3420, imgI));
        list.add(h("NRI General Hospital, Chinakakani", "Guntur", "Andhra Pradesh",
                "Chinakakani, Mangalagiri Mandal, Guntur 522503",
                "08645-231111", 4.3, 500.0, "Chinakakani", "Multi-Specialty",
                "Teaching hospital of NRI Medical College with broad specialty and super-specialty departments.",
                16.3680, 80.5240, imgJ));
        list.add(h("Government General Hospital, Guntur", "Guntur", "Andhra Pradesh",
                "Kannavarithota, Guntur 522002",
                "0863-2222211", 4.0, 200.0, "Kannavarithota", "Government",
                "Teaching hospital attached to Guntur Medical College serving the capital region.",
                16.3020, 80.4420, imgK));
        list.add(h("SVIMS (Sri Venkateswara Institute), Tirupati", "Tirupati", "Andhra Pradesh",
                "Alipiri Road, Tirupati 517507",
                "0877-2287777", 4.6, 400.0, "Alipiri", "Government",
                "State super-specialty university hospital known for cardiology, neurology, nephrology and oncology.",
                13.6327, 79.4015, imgL));
        list.add(h("Narayana Medical College Hospital, Nellore", "Nellore", "Andhra Pradesh",
                "Chinthareddypalem, Nellore 524003",
                "0861-2317965", 4.2, 450.0, "Chinthareddypalem", "Multi-Specialty",
                "Large teaching hospital serving south coastal AP with multi-specialty and critical-care services.",
                14.4670, 79.9970, imgM));
        list.add(h("Government General Hospital, Kurnool", "Kurnool", "Andhra Pradesh",
                "Budhawarapeta, Kurnool 518002",
                "08518-221111", 4.0, 250.0, "Budhawarapeta", "Government",
                "Teaching hospital of Kurnool Medical College, the main referral centre for Rayalaseema.",
                15.8280, 78.0370, imgN));
        list.add(h("GSL General Hospital, Rajahmundry", "Rajahmundry", "Andhra Pradesh",
                "Lakshmipuram, Rajahmundry 533101",
                "0883-2484999", 4.2, 450.0, "Lakshmipuram", "Multi-Specialty",
                "Teaching hospital of GSL Medical College with cardiology, neurology and surgical services.",
                17.0050, 81.7830, imgO));
        list.add(h("Government General Hospital, Kakinada", "Kakinada", "Andhra Pradesh",
                "Rangaraya Medical College Campus, Kakinada 533001",
                "0884-2360000", 4.1, 300.0, "Rangaraya", "Government",
                "Government teaching hospital attached to Rangaraya Medical College for east Godavari region.",
                16.9600, 82.2500, imgP));
        list.add(h("Ruia Government General Hospital, Tirupati", "Tirupati", "Andhra Pradesh",
                "K.T. Road, Tirupati 517501",
                "0877-2255666", 4.0, 250.0, "K.T. Road", "Government",
                "Teaching hospital of SV Medical College providing high-volume general and emergency care.",
                13.6300, 79.4190, imgQ));
        list.add(h("RIMS Hospital, Ongole", "Ongole", "Andhra Pradesh",
                "Koppolu Road, Ongole 523002",
                "08592-233333", 4.0, 300.0, "Koppolu Road", "Government",
                "Government teaching hospital serving Prakasam district with general specialties and emergency care.",
                15.5050, 80.0490, imgR));
        list.add(h("Government General Hospital, Anantapur", "Anantapur", "Andhra Pradesh",
                "Government Medical College Campus, Anantapur 515001",
                "08554-275000", 3.9, 250.0, "Anantapur", "Government",
                "District teaching hospital for western Rayalaseema with medicine, surgery and obstetrics.",
                14.6810, 77.5990, imgS));
        list.add(h("GEMS Hospital, Srikakulam", "Srikakulam", "Andhra Pradesh",
                "Ragolu, Srikakulam 532484",
                "08942-280000", 4.1, 400.0, "Ragolu", "Multi-Specialty",
                "Teaching hospital of Great Eastern Medical School serving north-coastal Andhra.",
                18.3030, 83.8980, imgT));
        list.add(h("CMC Vellore Chittoor Campus", "Chittoor", "Andhra Pradesh",
                "Gudipalla, Chittoor 517002",
                "0416-2282000", 4.7, 600.0, "Gudipalla", "Multi-Specialty",
                "CMC Vellore's Chittoor campus providing secondary and tertiary care for AP-TN border districts.",
                13.2000, 79.1160, imgA));

        // ================= TAMIL NADU (20) =================
        list.add(h("Apollo Hospitals, Greams Road", "Chennai", "Tamil Nadu",
                "21, Greams Lane, Off Greams Road, Chennai 600006",
                "044-28290200", 4.6, 1000.0, "Greams Road", "Multi-Specialty",
                "Apollo group's flagship hospital, a pioneer in cardiac surgery, transplants and robotic surgery in India.",
                13.0635, 80.2512, imgC));
        list.add(h("Fortis Malar Hospital, Adyar", "Chennai", "Tamil Nadu",
                "No. 52, 1st Main Road, Gandhi Nagar, Adyar, Chennai 600020",
                "044-42892222", 4.4, 900.0, "Adyar", "Multi-Specialty",
                "Fortis hospital in south Chennai known for cardiology, neurology and critical care.",
                12.9982, 80.2586, imgD));
        list.add(h("MIOT International, Manapakkam", "Chennai", "Tamil Nadu",
                "4/112, Mount Poonamallee Road, Manapakkam, Chennai 600089",
                "044-22492222", 4.6, 950.0, "Manapakkam", "Multi-Specialty",
                "Quarternary-care centre famous for orthopaedics, joint replacement and organ transplants.",
                13.0211, 80.1809, imgE));
        list.add(h("Sri Ramachandra Medical Centre, Porur", "Chennai", "Tamil Nadu",
                "No. 1, Ramachandra Nagar, Porur, Chennai 600116",
                "044-24768027", 4.5, 700.0, "Porur", "Multi-Specialty",
                "University teaching hospital with comprehensive specialty, transplant and trauma services.",
                13.0388, 80.1411, imgF));
        list.add(h("Rajiv Gandhi Govt. General Hospital", "Chennai", "Tamil Nadu",
                "Ponnusamy Road, Park Town, Chennai 600003",
                "044-25305000", 4.0, 200.0, "Park Town", "Government",
                "Tamil Nadu's largest government teaching hospital attached to Madras Medical College.",
                13.0818, 80.2780, imgG));
        list.add(h("Kauvery Hospital, Alwarpet", "Chennai", "Tamil Nadu",
                "81, TTK Road, Alwarpet, Chennai 600018",
                "044-40006000", 4.5, 800.0, "Alwarpet", "Multi-Specialty",
                "Kauvery group's flagship unit with cardiac sciences, nephrology and critical care.",
                13.0337, 80.2563, imgH));
        list.add(h("Gleneagles Global Hospitals, Perumbakkam", "Chennai", "Tamil Nadu",
                "439, Cheran Nagar, Perumbakkam, Chennai 600100",
                "044-44777000", 4.5, 900.0, "Perumbakkam", "Multi-Specialty",
                "Multi-organ transplant and tertiary-care centre in south-east Chennai.",
                12.8963, 80.2012, imgI));
        list.add(h("Christian Medical College (CMC), Vellore", "Vellore", "Tamil Nadu",
                "Ida Scudder Road, Vellore 632004",
                "0416-2282000", 4.7, 600.0, "Vellore Town", "Multi-Specialty",
                "Nationally renowned teaching hospital known for ethical, affordable tertiary and quaternary care.",
                12.9249, 79.1351, imgJ));
        list.add(h("PSG Hospitals, Coimbatore", "Coimbatore", "Tamil Nadu",
                "Peelamedu, Coimbatore 641004",
                "0422-2572222", 4.5, 650.0, "Peelamedu", "Multi-Specialty",
                "Teaching hospital of PSG medical college with oncology, cardiology and nephrology centres.",
                11.0304, 77.0025, imgK));
        list.add(h("Kovai Medical Center (KMCH), Coimbatore", "Coimbatore", "Tamil Nadu",
                "99, Avinashi Road, Coimbatore 641014",
                "0422-4324400", 4.6, 750.0, "Avinashi Road", "Multi-Specialty",
                "Large private hospital in Coimbatore with cardiac sciences, oncology and robotic surgery.",
                11.0774, 76.9958, imgL));
        list.add(h("Ganga Hospital, Coimbatore", "Coimbatore", "Tamil Nadu",
                "313, Mettupalayam Road, Coimbatore 641043",
                "0422-2485000", 4.7, 700.0, "Mettupalayam Road", "Specialty",
                "Internationally known centre for orthopaedics, trauma, plastic and microvascular surgery.",
                11.0319, 76.9342, imgM));
        list.add(h("Meenakshi Mission Hospital, Madurai", "Madurai", "Tamil Nadu",
                "Lake Area, Melur Road, Madurai 625107",
                "0452-2588999", 4.5, 600.0, "Melur Road", "Multi-Specialty",
                "Major tertiary hospital in southern TN with cardiac, neuro and cancer centres.",
                9.9267, 78.0891, imgN));
        list.add(h("Aravind Eye Hospital, Madurai", "Madurai", "Tamil Nadu",
                "1, Anna Nagar, Madurai 625020",
                "0452-4356100", 4.8, 400.0, "Anna Nagar", "Specialty",
                "World's largest eye-care network unit, famous for high-volume affordable cataract and retina care.",
                9.9526, 78.0870, imgO));
        list.add(h("Apollo Speciality Hospitals, Madurai", "Madurai", "Tamil Nadu",
                "Lake View Road, K.K. Nagar, Madurai 625020",
                "0452-2580891", 4.4, 700.0, "K.K. Nagar", "Multi-Specialty",
                "Apollo specialty unit in Madurai with cardiology, orthopaedics and critical care.",
                9.9090, 78.1460, imgP));
        list.add(h("Kauvery Hospital, Trichy", "Tiruchirappalli", "Tamil Nadu",
                "No. 92, Salai Road, Tennur, Tiruchirappalli 620018",
                "0431-4077777", 4.4, 600.0, "Tennur", "Multi-Specialty",
                "Kauvery group's Trichy unit with cardiac sciences, nephrology and emergency care.",
                10.8260, 78.6690, imgQ));
        list.add(h("Govt. Mohan Kumaramangalam Medical College Hospital, Salem", "Salem", "Tamil Nadu",
                "Steel Plant Road, Salem 636030",
                "0427-2383310", 4.0, 250.0, "Salem Steel Plant", "Government",
                "Government teaching hospital serving western Tamil Nadu districts.",
                11.6600, 78.1530, imgR));
        list.add(h("Sudha Hospitals, Erode", "Erode", "Tamil Nadu",
                "No. 162, Perundurai Road, Erode 638011",
                "0424-2422222", 4.3, 500.0, "Perundurai Road", "Specialty",
                "Well-known hospital group for fertility, maternity and multi-specialty care in Erode.",
                11.3410, 77.7170, imgS));
        list.add(h("Tirunelveli Medical College Hospital", "Tirunelveli", "Tamil Nadu",
                "High Ground Road, Tirunelveli 627011",
                "0462-2572733", 4.0, 250.0, "High Ground", "Government",
                "Government teaching hospital and referral centre for southern Tamil Nadu.",
                8.7190, 77.7260, imgT));
        list.add(h("Meenakshi Hospital, Thanjavur", "Thanjavur", "Tamil Nadu",
                "No. 72, Trichy Road, Thanjavur 613005",
                "04362-240000", 4.2, 400.0, "Trichy Road", "Multi-Specialty",
                "Regional multi-specialty hospital serving the Cauvery delta districts.",
                10.7760, 79.1370, imgA));
        list.add(h("Stanley Medical College Hospital, Chennai", "Chennai", "Tamil Nadu",
                "Old Jail Road, Royapuram, Chennai 600001",
                "044-25281351", 4.0, 200.0, "Royapuram", "Government",
                "Historic government teaching hospital in north Chennai with surgical and medical super-specialties.",
                13.1040, 80.2870, imgB));

        // ================= KARNATAKA (20) =================
        list.add(h("Narayana Health City, Bommasandra", "Bengaluru", "Karnataka",
                "258/A, Bommasandra Industrial Area, Hosur Road, Bengaluru 560099",
                "080-71222222", 4.5, 800.0, "Bommasandra", "Multi-Specialty",
                "Narayana Health flagship campus with cardiac surgery, oncology, neurology and transplant institutes.",
                12.8646, 77.6978, imgD));
        list.add(h("Manipal Hospitals, Old Airport Road", "Bengaluru", "Karnataka",
                "98, HAL Old Airport Road, Kodihalli, Bengaluru 560017",
                "080-25004444", 4.6, 900.0, "Kodihalli", "Multi-Specialty",
                "Manipal group's flagship hospital with comprehensive tertiary and quaternary care.",
                12.9603, 77.6419, imgE));
        list.add(h("Fortis Hospital, Cunningham Road", "Bengaluru", "Karnataka",
                "14, Cunningham Road, Bengaluru 560052",
                "080-41994444", 4.5, 950.0, "Cunningham Road", "Multi-Specialty",
                "Fortis tertiary hospital in central Bengaluru for cardiac sciences, neurosciences and oncology.",
                12.9816, 77.5946, imgF));
        list.add(h("St. John's Medical College Hospital, Koramangala", "Bengaluru", "Karnataka",
                "Sarjapur Road, Koramangala, Bengaluru 560034",
                "080-49467000", 4.5, 600.0, "Koramangala", "Multi-Specialty",
                "Large teaching hospital known for ethical care, emergency medicine and community health.",
                12.9356, 77.6236, imgG));
        list.add(h("NIMHANS, Hosur Road", "Bengaluru", "Karnataka",
                "Hosur Road, Lakkasandra, Bengaluru 560029",
                "080-26995000", 4.6, 300.0, "Lakkasandra", "Specialty",
                "Institute of National Importance for neurology, neurosurgery and mental health.",
                12.9432, 77.5963, imgH));
        list.add(h("Sakra World Hospital, Bellandur", "Bengaluru", "Karnataka",
                "52/2 & 52/3, Devarabeesanahalli, Varthur Hobli, Bellandur, Bengaluru 560103",
                "080-49694969", 4.6, 950.0, "Bellandur", "Multi-Specialty",
                "Japanese-technology-partnered hospital with advanced neuro, ortho and digestive-disease centres.",
                12.9246, 77.6887, imgI));
        list.add(h("Aster CMI Hospital, Hebbal", "Bengaluru", "Karnataka",
                "No. 43/2, New Airport Road, Hebbal, Bengaluru 560092",
                "080-43420100", 4.5, 850.0, "Hebbal", "Multi-Specialty",
                "Aster tertiary hospital in north Bengaluru with oncology, cardiac and transplant programs.",
                13.0621, 77.5960, imgJ));
        list.add(h("Cloudnine Hospital, Old Airport Road", "Bengaluru", "Karnataka",
                "1533, 9th Main, Old Airport Road, Bengaluru 560017",
                "080-67999999", 4.5, 1000.0, "Old Airport Road", "Specialty",
                "Premium maternity, neonatal and fertility hospital chain's flagship Bengaluru unit.",
                12.9600, 77.6400, imgK));
        list.add(h("Apollo Hospitals, Jayanagar", "Bengaluru", "Karnataka",
                "21/2, 3rd Block, Jayanagar, Bengaluru 560011",
                "080-46124444", 4.4, 800.0, "Jayanagar", "Multi-Specialty",
                "Apollo specialty hospital in south Bengaluru with cardiology, orthopaedics and critical care.",
                12.9250, 77.5938, imgL));
        list.add(h("Kidwai Memorial Institute of Oncology", "Bengaluru", "Karnataka",
                "Dr. M.H. Marigowda Road, Dairy Circle, Bengaluru 560029",
                "080-26094000", 4.3, 250.0, "Dairy Circle", "Government",
                "State-run regional cancer centre providing affordable medical, surgical and radiation oncology.",
                12.9430, 77.5890, imgM));
        list.add(h("JSS Hospital, Mysuru", "Mysuru", "Karnataka",
                "M.G. Road, Agrahara, Mysuru 570004",
                "0821-2335555", 4.4, 500.0, "Agrahara", "Multi-Specialty",
                "Teaching hospital of JSS Medical College, a major referral centre for south Karnataka.",
                12.3020, 76.6540, imgN));
        list.add(h("Apollo BGS Hospitals, Mysuru", "Mysuru", "Karnataka",
                "Adichunchanagiri Road, Kuvempunagar, Mysuru 570023",
                "0821-2566666", 4.5, 650.0, "Kuvempunagar", "Multi-Specialty",
                "Apollo tertiary hospital in Mysuru with cardiac sciences, neurology and emergency care.",
                12.2958, 76.6399, imgO));
        list.add(h("KMC Hospital, Mangaluru", "Mangaluru", "Karnataka",
                "Ambedkar Circle, Mangaluru 575001",
                "0824-2222222", 4.4, 600.0, "Ambedkar Circle", "Multi-Specialty",
                "Teaching hospital of Kasturba Medical College with comprehensive specialty services.",
                12.8670, 74.8420, imgP));
        list.add(h("A.J. Hospital, Mangaluru", "Mangaluru", "Karnataka",
                "Kuntikana, Mangaluru 575004",
                "0824-6610000", 4.4, 600.0, "Kuntikana", "Multi-Specialty",
                "Teaching hospital of A.J. Institute, a key tertiary centre for coastal Karnataka.",
                12.9130, 74.8560, imgQ));
        list.add(h("KLE Dr. Prabhakar Kore Hospital, Belagavi", "Belagavi", "Karnataka",
                "Nehru Nagar, Belagavi 590010",
                "0831-2474000", 4.3, 500.0, "Nehru Nagar", "Multi-Specialty",
                "Teaching hospital of KLE medical university serving north Karnataka and border regions.",
                15.8780, 74.5130, imgR));
        list.add(h("Karnataka Institute of Medical Sciences (KIMS), Hubballi", "Hubballi", "Karnataka",
                "Vidyanagar, Hubballi 580022",
                "0836-2370000", 4.1, 300.0, "Vidyanagar", "Government",
                "Government teaching hospital and referral centre for north-central Karnataka.",
                15.3640, 75.1240, imgS));
        list.add(h("SSIMS Hospital, Davangere", "Davangere", "Karnataka",
                "JMIT Campus, Davangere 577501",
                "08192-266000", 4.2, 400.0, "Davangere", "Multi-Specialty",
                "Teaching hospital serving central Karnataka with general and super-specialty departments.",
                14.4640, 75.9210, imgT));
        list.add(h("McGann Hospital, Shivamogga", "Shivamogga", "Karnataka",
                "Durgigudi, Shivamogga 577201",
                "08182-272222", 4.0, 300.0, "Durgigudi", "Government",
                "Government teaching hospital attached to Shivamogga Institute of Medical Sciences.",
                13.9290, 75.5680, imgA));
        list.add(h("SDM College of Medical Sciences, Dharwad", "Dharwad", "Karnataka",
                "Manjushree Nagar, Sattur, Dharwad 580009",
                "0836-2460000", 4.3, 550.0, "Sattur", "Multi-Specialty",
                "Teaching hospital with cardiac, neuro and oncology services for north Karnataka.",
                15.4600, 75.0020, imgB));
        list.add(h("Yenepoya Medical College Hospital, Mangaluru", "Mangaluru", "Karnataka",
                "Deralakatte, Mangaluru 575018",
                "0824-2204668", 4.3, 550.0, "Deralakatte", "Multi-Specialty",
                "NABH-accredited teaching hospital in south Mangaluru with broad specialty coverage.",
                12.8590, 74.8420, imgC));

        return list;
    }
}
