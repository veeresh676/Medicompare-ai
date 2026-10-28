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
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Gives every hospital a full, realistic service catalog instead of
 * just the 5 generic services.
 *
 * - ALL hospitals: 8 core extras (emergency, surgery, pediatrics,
 *   gynecology, ENT, ophthalmology, executive checkup, physio).
 * - LARGE hospitals (teaching + multi/super-specialty): 5 advanced
 *   diagnostics & critical-care services.
 * - SPECIALTY hospitals (matched by name): focused packs for eye,
 *   cancer, children, maternity, cardiac, neuro, ortho and gastro.
 *
 * Prices are tiered: government facilities lowest, teaching in the
 * middle, private highest — typical Indian price bands per category.
 * Admins can edit any price afterwards; existing rows are never
 * overwritten, and inserts are skipped when the service already
 * exists for that hospital (idempotent).
 */
@Configuration
public class HospitalServiceCatalogInitializer {

    private record Template(
            String name,
            String description,
            String category,
            int durationMinutes,
            double govtPrice,
            double teachingPrice,
            double privatePrice) {
    }

    private enum Tier {
        GOVT, TEACHING, PRIVATE
    }

    // ================= CORE EXTRAS (every hospital) =================

    private static final List<Template> CORE = List.of(
            new Template("Emergency & Casualty Care",
                    "Round-the-clock emergency assessment, stabilisation and casualty care.",
                    "Emergency", 60, 300, 400, 800),
            new Template("General Surgery Consultation",
                    "Evaluation for hernias, gall bladder, appendix and other routine surgical needs.",
                    "General Surgery", 30, 200, 300, 700),
            new Template("Pediatrics Consultation",
                    "Child health consultation covering growth, immunisation and common illnesses.",
                    "Pediatrics", 30, 200, 300, 600),
            new Template("Gynecology Consultation",
                    "Women's health consultation including menstrual, hormonal and reproductive concerns.",
                    "Obstetrics & Gynecology", 30, 200, 300, 600),
            new Template("ENT Consultation",
                    "Ear, nose, throat and hearing-related evaluation with diagnostic support.",
                    "ENT", 30, 200, 300, 600),
            new Template("Ophthalmology Consultation",
                    "Comprehensive eye examination including vision testing and retinal screening.",
                    "Ophthalmology", 30, 200, 300, 600),
            new Template("Executive Health Checkup",
                    "Comprehensive preventive package: cardiac, diabetes, liver, kidney and cancer screening with physician review.",
                    "Preventive Care", 120, 1500, 2000, 3500),
            new Template("Physiotherapy Session",
                    "Guided rehabilitation session for pain, post-surgical recovery and mobility.",
                    "Physiotherapy", 45, 200, 250, 500));

    // ================= LARGE HOSPITALS =================

    private static final List<Template> LARGE = List.of(
            new Template("MRI Scan",
                    "High-resolution magnetic resonance imaging with radiologist reporting.",
                    "Radiology", 45, 2500, 3500, 7000),
            new Template("CT Scan",
                    "Computed tomography imaging with contrast option and specialist reporting.",
                    "Radiology", 20, 1500, 2000, 4500),
            new Template("Ultrasound & Doppler Study",
                    "Abdominal, pelvic and vascular Doppler imaging with same-day reporting.",
                    "Radiology", 20, 500, 700, 1200),
            new Template("ICU / Critical Care (per day)",
                    "Intensive care with ventilator support, monitoring and intensivist cover.",
                    "Critical Care", 1440, 3000, 5000, 12000),
            new Template("Dialysis Session",
                    "Supervised haemodialysis session with nephrologist oversight.",
                    "Nephrology", 240, 800, 1000, 2000));

    // ================= SPECIALTY PACKS =================

    private static final List<Template> EYE = List.of(
            new Template("Cataract Evaluation",
                    "Complete cataract workup including biometry and lens options counselling.",
                    "Ophthalmology", 45, 300, 400, 800),
            new Template("Retina Consultation",
                    "Dilated retinal examination with OCT imaging for diabetic and age-related disease.",
                    "Ophthalmology", 30, 300, 400, 900),
            new Template("Glaucoma Screening",
                    "Eye pressure, optic nerve and visual field assessment for early glaucoma detection.",
                    "Ophthalmology", 30, 250, 350, 700),
            new Template("LASIK Evaluation",
                    "Eligibility workup for laser vision correction with corneal mapping.",
                    "Ophthalmology", 30, 500, 700, 1500),
            new Template("Pediatric Ophthalmology",
                    "Squint, lazy eye and refractive screening for children.",
                    "Ophthalmology", 30, 250, 350, 700));

    private static final List<Template> CANCER = List.of(
            new Template("Medical Oncology Consultation",
                    "Cancer diagnosis review, staging discussion and treatment planning.",
                    "Oncology", 30, 400, 500, 1000),
            new Template("Chemotherapy Session",
                    "Day-care chemotherapy administration with oncology supervision.",
                    "Oncology", 180, 2000, 3000, 8000),
            new Template("Radiation Therapy Planning",
                    "Simulation, contouring and planning for external beam radiotherapy.",
                    "Radiation Oncology", 45, 2500, 4000, 10000),
            new Template("Cancer Screening Package",
                    "Age-appropriate screening: mammography, Pap smear, PSA and low-dose CT guidance.",
                    "Preventive Care", 120, 1500, 2000, 4000),
            new Template("Palliative Care Consultation",
                    "Pain and symptom management with psychosocial support for patients and families.",
                    "Palliative Care", 45, 300, 400, 800));

    private static final List<Template> CHILDREN = List.of(
            new Template("Neonatal Care (per day)",
                    "NICU care for premature and high-risk newborns with neonatologist cover.",
                    "Neonatology", 1440, 1500, 2000, 5000),
            new Template("Pediatric Emergency",
                    "Round-the-clock emergency care equipped for infants and children.",
                    "Pediatrics", 60, 300, 400, 800),
            new Template("Childhood Immunization",
                    "National-schedule and optional vaccines with growth assessment.",
                    "Pediatrics", 30, 500, 700, 1500),
            new Template("Pediatric Surgery Consultation",
                    "Evaluation for congenital and acquired surgical conditions in children.",
                    "Pediatric Surgery", 30, 400, 500, 1000));

    private static final List<Template> MATERNITY = List.of(
            new Template("Antenatal Package",
                    "Complete pregnancy package: scans, blood work, consultations and birth planning.",
                    "Obstetrics", 60, 2000, 3000, 6000),
            new Template("Normal Delivery Package",
                    "Labour room delivery with obstetrician, nursing and newborn care.",
                    "Obstetrics", 1440, 15000, 20000, 45000),
            new Template("Cesarean Package",
                    "Planned or emergency C-section with anaesthesia, OT and postnatal stay.",
                    "Obstetrics", 1440, 25000, 35000, 75000),
            new Template("Fertility Consultation",
                    "Evaluation for infertility including hormonal workup and treatment roadmap.",
                    "Reproductive Medicine", 45, 500, 800, 1500));

    private static final List<Template> CARDIAC = List.of(
            new Template("Echocardiography",
                    "2D echo with Doppler to assess heart chambers, valves and pumping function.",
                    "Cardiology", 30, 800, 1000, 2000),
            new Template("TMT Stress Test",
                    "Treadmill exercise ECG to detect exercise-induced cardiac ischemia.",
                    "Cardiology", 45, 800, 1000, 1800),
            new Template("Coronary Angiography",
                    "Catheter-based imaging of coronary arteries in a cath lab setting.",
                    "Cardiology", 90, 8000, 12000, 25000),
            new Template("Cardiac Surgery Consultation",
                    "Evaluation for bypass, valve and congenital heart surgery options.",
                    "Cardiac Surgery", 30, 600, 800, 1500),
            new Template("Holter Monitoring (24 hr)",
                    "24-hour ambulatory ECG recording for rhythm and ischemia detection.",
                    "Cardiology", 60, 1000, 1200, 2500));

    private static final List<Template> NEURO = List.of(
            new Template("EEG Study",
                    "Electroencephalogram recording for seizure and brain-function evaluation.",
                    "Neurology", 45, 600, 800, 1500),
            new Template("Epilepsy Clinic",
                    "Specialist review, drug optimisation and surgical candidacy assessment.",
                    "Neurology", 30, 300, 400, 800),
            new Template("Stroke Clinic",
                    "Rapid evaluation, thrombolysis triage and post-stroke rehabilitation planning.",
                    "Neurology", 30, 300, 400, 800),
            new Template("Neurosurgery Consultation",
                    "Evaluation for brain and spine surgery including minimally invasive options.",
                    "Neurosurgery", 30, 500, 700, 1500));

    private static final List<Template> ORTHO = List.of(
            new Template("Joint Replacement Evaluation",
                    "Workup for knee and hip replacement including X-ray templating and fitness assessment.",
                    "Orthopedics", 30, 500, 700, 1500),
            new Template("Arthroscopy (Keyhole Surgery)",
                    "Minimally invasive knee and shoulder procedures with faster recovery.",
                    "Orthopedics", 60, 1500, 2500, 6000),
            new Template("Spine Clinic",
                    "Back and neck pain evaluation with MRI correlation and physio planning.",
                    "Orthopedics", 30, 400, 500, 1000),
            new Template("Sports Injury Clinic",
                    "Ligament, tendon and fracture care for athletes and active patients.",
                    "Orthopedics", 30, 300, 400, 800));

    private static final List<Template> GASTRO = List.of(
            new Template("Upper GI Endoscopy",
                    "Diagnostic endoscopy with biopsy facility and sedation option.",
                    "Gastroenterology", 30, 1500, 2000, 4500),
            new Template("Colonoscopy",
                    "Colonic evaluation with polyp removal facility under sedation.",
                    "Gastroenterology", 45, 2000, 3000, 6000),
            new Template("Liver Clinic",
                    "Fatty liver, hepatitis and cirrhosis evaluation with FibroScan support.",
                    "Hepatology", 30, 300, 400, 800),
            new Template("Liver FibroScan",
                    "Non-invasive liver stiffness measurement for fibrosis staging.",
                    "Hepatology", 20, 800, 1000, 2000));

    @Bean
    @Order(23)
    CommandLineRunner seedServiceCatalog(
            HospitalRepository hospitalRepository,
            HospitalServiceRepository serviceRepository
    ) {
        return args -> {
            System.out.println("Starting hospital service catalog seed...");

            List<Hospital> hospitals = hospitalRepository.findAll();
            int inserted = 0;

            for (Hospital hospital : hospitals) {
                Tier tier = resolveTier(hospital);

                for (Template template : CORE) {
                    if (insertService(hospital, serviceRepository, template, tier)) {
                        inserted++;
                    }
                }

                if (isLarge(hospital)) {
                    for (Template template : LARGE) {
                        if (insertService(hospital, serviceRepository, template, tier)) {
                            inserted++;
                        }
                    }
                }

                for (Template template : specialtyPack(hospital)) {
                    if (insertService(hospital, serviceRepository, template, tier)) {
                        inserted++;
                    }
                }
            }

            System.out.println("Service catalog seed inserted: " + inserted
                    + " | total services: " + serviceRepository.count());
        };
    }

    private Tier resolveTier(Hospital hospital) {
        String type = hospital.getHospitalType() == null
                ? "" : hospital.getHospitalType().toLowerCase(Locale.ROOT);
        String name = hospital.getName() == null
                ? "" : hospital.getName().toLowerCase(Locale.ROOT);

        if (type.contains("government")
                || name.contains("sathya sai")
                || name.contains("charitable")
                || name.contains("trust hospital")) {
            return Tier.GOVT;
        }

        if (name.contains("medical college")
                || name.contains("institute of medical")
                || name.contains("dental college")
                || name.contains("kakatiya")
                || name.contains("mamata")
                || name.contains("asram")
                || name.contains("santhiram")
                || name.contains("maharajah")
                || name.contains("rims")) {
            return Tier.TEACHING;
        }

        return Tier.PRIVATE;
    }

    private boolean isLarge(Hospital hospital) {
        String type = hospital.getHospitalType() == null
                ? "" : hospital.getHospitalType().toLowerCase(Locale.ROOT);

        if (type.contains("multi")
                || type.contains("super")
                || type.contains("specialty")
                || type.contains("speciality")) {
            return true;
        }

        return resolveTier(hospital) == Tier.TEACHING;
    }

    private List<Template> specialtyPack(Hospital hospital) {
        String name = hospital.getName() == null
                ? "" : hospital.getName().toLowerCase(Locale.ROOT);

        List<Template> pack = new ArrayList<>();

        if (containsAny(name, "eye", "netralaya", "agarwal", "vasan", "vision", "aravind")) {
            pack.addAll(EYE);
        }
        if (containsAny(name, "cancer", "oncology", "kidwai", "basavatarakam")) {
            pack.addAll(CANCER);
        }
        if (containsAny(name, "children", "child", "rainbow", "pediatric", "neonatal", "newborn")) {
            pack.addAll(CHILDREN);
        }
        if (containsAny(name, "maternity", "mother", "cloudnine", "antenatal", "fertility", "sudha", "women")) {
            pack.addAll(MATERNITY);
        }
        if (containsAny(name, "cardiac", "heart", "narayana")) {
            pack.addAll(CARDIAC);
        }
        if (containsAny(name, "neuro", "nimhans", "brain", "mental health")) {
            pack.addAll(NEURO);
        }
        if (containsAny(name, "ortho", "ganga", "bone", "joint", "spine")) {
            pack.addAll(ORTHO);
        }
        if (containsAny(name, "gastro", "aig", "liver", "digestive")) {
            pack.addAll(GASTRO);
        }

        return pack;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private boolean insertService(
            Hospital hospital,
            HospitalServiceRepository repository,
            Template template,
            Tier tier
    ) {
        if (repository.existsByHospitalIdAndNameIgnoreCase(
                hospital.getId(),
                template.name())) {
            return false;
        }

        double price = switch (tier) {
            case GOVT -> template.govtPrice();
            case TEACHING -> template.teachingPrice();
            case PRIVATE -> template.privatePrice();
        };

        HospitalService service = new HospitalService();
        service.setHospital(hospital);
        service.setName(template.name());
        service.setDescription(template.description());
        service.setPrice(BigDecimal.valueOf(price));
        service.setCategory(template.category());
        service.setDurationMinutes(template.durationMinutes());
        service.setAvailable(true);

        repository.save(service);
        return true;
    }
}
