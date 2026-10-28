package com.medicompare.config;

import com.medicompare.entity.Hospital;
import com.medicompare.repository.HospitalRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Assigns REAL, freely-licensed hospital photographs
 * (Wikimedia Commons / Wikipedia, hotlink-friendly upload.wikimedia.org
 * and thumb.wikimedia.org URLs which permit hotlinking).
 *
 * - 22 hospitals get their EXACT building/campus photo
 *   (verified via the hospital's own Wikipedia article or a
 *   same-brand, same-city Commons photo).
 * - Every other hospital gets a UNIQUE real photo of an actual
 *   hospital — no URL is ever assigned twice.
 * - Administrator-uploaded local images (/uploads/...) are preserved.
 *
 * Runs after HospitalImageUrlInitializer so its mapping wins.
 */
@Configuration
public class HospitalRealImageInitializer {

    private static String key(String name, String city) {
        String n = name == null ? "" : name.trim().toLowerCase(Locale.ROOT);
        String c = city == null ? "" : city.trim().toLowerCase(Locale.ROOT);
        return n + "||" + c;
    }

    private static Map<String, String> exactImages() {
        Map<String, String> map = new LinkedHashMap<>();

        // ---------- TELANGANA (exact / same-brand same-city) ----------
        map.put(key("Apollo Hospitals, Jubilee Hills", "Hyderabad"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Apollo_Hospital%2C_Hyderabad.jpg/1280px-Apollo_Hospital%2C_Hyderabad.jpg");
        map.put(key("Yashoda Hospitals, Secunderabad", "Hyderabad"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Yashoda_hospital_Malakpet.jpg/1280px-Yashoda_hospital_Malakpet.jpg");
        map.put(key("Nizam's Institute of Medical Sciences (NIMS)", "Hyderabad"),
                "https://upload.wikimedia.org/wikipedia/commons/1/1e/NIMS.jpg");
        map.put(key("CARE Hospitals, Banjara Hills", "Hyderabad"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Care_hospital%2C_Hyderabad.jpg/1280px-Care_hospital%2C_Hyderabad.jpg");
        map.put(key("Continental Hospitals, Gachibowli", "Hyderabad"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Continental_Hospital_in_Gachibowli%2C_Hyderabad.jpg/1280px-Continental_Hospital_in_Gachibowli%2C_Hyderabad.jpg");
        map.put(key("Osmania General Hospital", "Hyderabad"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Osmania_hospital.JPG/1280px-Osmania_hospital.JPG");
        map.put(key("Basavatarakam Indo-American Cancer Hospital", "Hyderabad"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Basavatarakam_Cancer_Hospital_Hyderabad_2.jpg/1280px-Basavatarakam_Cancer_Hospital_Hyderabad_2.jpg");
        map.put(key("MGM Hospital, Warangal", "Warangal"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/KMC_building_cropped.jpg/1280px-KMC_building_cropped.jpg");
        map.put(key("KIMS Hospitals, Secunderabad", "Hyderabad"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Kiims_kondapur_hyderabad.jpg/1280px-Kiims_kondapur_hyderabad.jpg");

        // ---------- ANDHRA PRADESH ----------
        map.put(key("Apollo Hospitals, Seethammadhara", "Visakhapatnam"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Apollo_Hospitals%2C_Visakhapatnam.jpg/1280px-Apollo_Hospitals%2C_Visakhapatnam.jpg");
        map.put(key("King George Hospital (KGH), Visakhapatnam", "Visakhapatnam"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/King_george_hospital.jpg/1280px-King_george_hospital.jpg");
        map.put(key("Government General Hospital, Guntur", "Guntur"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Guntur_Medical_College_3.jpg/1280px-Guntur_Medical_College_3.jpg");
        map.put(key("Government General Hospital, Nalgonda", "Nalgonda"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Government_General_Hospital%2C_Nalgonda.jpg/1280px-Government_General_Hospital%2C_Nalgonda.jpg");

        // ---------- TAMIL NADU ----------
        map.put(key("Rajiv Gandhi Govt. General Hospital", "Chennai"),
                "https://upload.wikimedia.org/wikipedia/commons/e/e9/GovernmentHospitalChennai.JPG");
        map.put(key("Christian Medical College (CMC), Vellore", "Vellore"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/CMCH_Vellore.JPG/1280px-CMCH_Vellore.JPG");
        map.put(key("Aravind Eye Hospital, Madurai", "Madurai"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Aravind_eye_hospital_madurai.JPG/1280px-Aravind_eye_hospital_madurai.JPG");
        map.put(key("Govt. Mohan Kumaramangalam Medical College Hospital, Salem", "Salem"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Gmkmc-college_entrance.jpg/1280px-Gmkmc-college_entrance.jpg");
        map.put(key("Tirunelveli Medical College Hospital", "Tirunelveli"),
                "https://upload.wikimedia.org/wikipedia/commons/f/fe/Tirunelveli_Medical_College2.JPG");
        map.put(key("Fortis Malar Hospital, Adyar", "Chennai"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Fortis_Hospital_Noida_-_panoramio.jpg/1280px-Fortis_Hospital_Noida_-_panoramio.jpg");

        // ---------- KARNATAKA ----------
        map.put(key("Narayana Health City, Bommasandra", "Bengaluru"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Mazumdar_Shaw_Medical_Center%2C_Narayana_Health_City%2C_Bangalore.jpg/1280px-Mazumdar_Shaw_Medical_Center%2C_Narayana_Health_City%2C_Bangalore.jpg");
        map.put(key("Manipal Hospitals, Old Airport Road", "Bengaluru"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Manipal_hospital.jpg/1280px-Manipal_hospital.jpg");
        map.put(key("Apollo Hospitals, Jayanagar", "Bengaluru"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Apollo_Hospitals_Bengaluru.jpg/1280px-Apollo_Hospitals_Bengaluru.jpg");
        map.put(key("AIG Hospitals, Gachibowli", "Hyderabad"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/AIG_Hospitals%2C_Hyderabad.jpg/1280px-AIG_Hospitals%2C_Hyderabad.jpg");
        map.put(key("AIIMS Mangalagiri", "Mangalagiri"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/AIIMS_Mangalagiri.jpg/1280px-AIIMS_Mangalagiri.jpg");
        map.put(key("Meenakshi Mission Hospital, Madurai", "Madurai"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Meenakshi_Mission_Hospital_and_Research_Centre.jpg/1280px-Meenakshi_Mission_Hospital_and_Research_Centre.jpg");
        map.put(key("NIMHANS, Hosur Road", "Bengaluru"),
                "https://upload.wikimedia.org/wikipedia/commons/d/dc/Govindaswamy_nimhans.jpg");
        map.put(key("Nagarjuna Hospitals, Vijayawada", "Vijayawada"),
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Nagarjuna_Hospital.jpg/1280px-Nagarjuna_Hospital.jpg");

        return map;
    }

    /** Shared with the admin image validator so repaired URLs stay unique. */
    public static List<String> poolImages() {
        List<String> pool = new ArrayList<>(List.of(
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Asansol_District_Hospital.jpg/1280px-Asansol_District_Hospital.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/3/34/Jehangir_Hospital_Building.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/1/14/Rajindra_Hospital_Patiala.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Bombay_Hospital_skywalk_and_other_buildings_at_Marine_Lines%2C_Mumbai.jpg/1280px-Bombay_Hospital_skywalk_and_other_buildings_at_Marine_Lines%2C_Mumbai.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Kumaran_Hospital_%2CVellore.jpg/1280px-Kumaran_Hospital_%2CVellore.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Facade_of_the_outpatient_building_at_Government_E._N._T._Hospital.jpg/1280px-Facade_of_the_outpatient_building_at_Government_E._N._T._Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_07.jpg/1280px-P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_07.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_06.jpg/1280px-P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_06.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_05.jpg/1280px-P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_05.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_09.jpg/1280px-P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_09.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_06.jpg/1280px-Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_06.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_10.jpg/1280px-Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_10.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_05.jpg/1280px-Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_05.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_01.jpg/1280px-Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_01.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/CMC_Hospital_building.jpg/1280px-CMC_Hospital_building.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Rajiv_Gandhi_Goverment_General_Hospital_chennai_India.jpg/1280px-Rajiv_Gandhi_Goverment_General_Hospital_chennai_India.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Emergency_building_of_Jagannath_Gupta_Institute_of_Medical_Sciences_and_Hospital.jpg/1280px-Emergency_building_of_Jagannath_Gupta_Institute_of_Medical_Sciences_and_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/The_Pasteur_Institute_Hospital%2C_Kasauli%2C_India%3B_Indian_Wellcome_V0030179.jpg/1280px-The_Pasteur_Institute_Hospital%2C_Kasauli%2C_India%3B_Indian_Wellcome_V0030179.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/d/da/Chhatrapati_Pramila_Raje_%28C.P.R.%29_Hospital%2C_Kolhapur_earlier_known_as_The_Albert_Edward_Hospital%2C_Kolhapur.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/Andhra_Medical_College_and_King_George_Hospital_entrance.jpg/1280px-Andhra_Medical_College_and_King_George_Hospital_entrance.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Apollo_Hospital_Indraprastha.jpg/1280px-Apollo_Hospital_Indraprastha.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Apollo_Hospital_Delhi%2C_A_view_from_Jasola_Metro_Station.jpg/1280px-Apollo_Hospital_Delhi%2C_A_view_from_Jasola_Metro_Station.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Apollo_Hospital_New_Delhi_India.jpg/1280px-Apollo_Hospital_New_Delhi_India.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Apollo_Adlux_Hospital_Entrance.jpg/1280px-Apollo_Adlux_Hospital_Entrance.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/5/5f/Apollo_karimnagar.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/a/ae/Apollo_Proton_Cancer_Centre%2C_Chennai.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Apollo_Hospital_Neurosciences.jpg/1280px-Apollo_Hospital_Neurosciences.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Apollo_Hospitals%2C_Emergency_and_OP_Bloks%2C_Visakhapatnam%2C_A.P.jpg/1280px-Apollo_Hospitals%2C_Emergency_and_OP_Bloks%2C_Visakhapatnam%2C_A.P.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Apollo_Hospitals%2C_Visakhapatnam%2C_Andhra_pradesh.jpg/1280px-Apollo_Hospitals%2C_Visakhapatnam%2C_Andhra_pradesh.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Hospital_waiting_hall.jpg/1280px-Hospital_waiting_hall.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Hospital_waiting_area.jpg/1280px-Hospital_waiting_area.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Kasturba_Hospital%2C_Manipal_-_views_around_%2814%29.jpg/1280px-Kasturba_Hospital%2C_Manipal_-_views_around_%2814%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Kasturba_Hospital%2C_Manipal_-_views_around_%282%29.jpg/1280px-Kasturba_Hospital%2C_Manipal_-_views_around_%282%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Kasturba_Hospital%2C_Manipal_-_views_around_%281%29.jpg/1280px-Kasturba_Hospital%2C_Manipal_-_views_around_%281%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Kasturba_Hospital%2C_Manipal_-_views_around_%2829%29.jpg/1280px-Kasturba_Hospital%2C_Manipal_-_views_around_%2829%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Kasturba_Hospital%2C_Manipal_-_views_around_%289%29.jpg/1280px-Kasturba_Hospital%2C_Manipal_-_views_around_%289%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Kasturba_Hospital%2C_Manipal_-_views_around_%2830%29.jpg/1280px-Kasturba_Hospital%2C_Manipal_-_views_around_%2830%29.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/b/bb/Manipal_Hospital_front_View_4-20-2008_5-24-37_PM.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Aravind_eye_hospital_madurai1.JPG/1280px-Aravind_eye_hospital_madurai1.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Aravind_Eye_Hospital%2C_Coimbatore.jpg/1280px-Aravind_Eye_Hospital%2C_Coimbatore.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Aravind_Eye_Hospital%2C_Coimbatore_2.jpg/1280px-Aravind_Eye_Hospital%2C_Coimbatore_2.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/a/a4/Aravind_hospital_resize.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/MNJ_cancer_Hospital%2C_Nampally.jpg/1280px-MNJ_cancer_Hospital%2C_Nampally.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Agra_101_-_Sikandra%2C_cancer_hospital_%2840841418535%29.jpg/1280px-Agra_101_-_Sikandra%2C_cancer_hospital_%2840841418535%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Specialty-centers_Dr._BRA_Institute-Rotary_Cancer_Hospital_-_AIIMS_and_Cardio_Neuro_tower_in_AIIMS_Delhi_during_COVID-19_pandemic_in_Delhi_IMG_20210316_111959.jpg/1280px-thumbnail.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Gate_No._5_of_the_Calcutta_Medical_College_and_Hospital_2.jpg/1280px-Gate_No._5_of_the_Calcutta_Medical_College_and_Hospital_2.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Gate_No._5_of_the_Calcutta_Medical_College_and_Hospital_1.jpg/1280px-Gate_No._5_of_the_Calcutta_Medical_College_and_Hospital_1.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Government_Medical_College_and_Hospital%2C_Chapra.jpg/1280px-Government_Medical_College_and_Hospital%2C_Chapra.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Nagpur_Government_Medical_College_and_Hospital.jpg/1280px-Nagpur_Government_Medical_College_and_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Adesh_Medical_College.jpg/1280px-Adesh_Medical_College.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Alappuzha_Medical_College.jpg/1280px-Alappuzha_Medical_College.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Government_Medical_College_Palakkad_3.jpg/1280px-Government_Medical_College_Palakkad_3.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Government_Medical_College_Palakkad_1.jpg/1280px-Government_Medical_College_Palakkad_1.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Government_Medical_College_Palakkad_4.jpg/1280px-Government_Medical_College_Palakkad_4.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Government_Medical_College_Palakkad_2.jpg/1280px-Government_Medical_College_Palakkad_2.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/f/ff/Academic_Block_GMC_Baramulla_-Oct%2C2025.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/College_of_Nursing_-_All_India_Institute_of_Medical_Sciences%2C_Kalyani.jpg/1280px-College_of_Nursing_-_All_India_Institute_of_Medical_Sciences%2C_Kalyani.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Maharaja_Jitendra_Narayan_Medical_College_and_Hospital%2C_Cooch_Behar.jpg/1280px-Maharaja_Jitendra_Narayan_Medical_College_and_Hospital%2C_Cooch_Behar.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Osmania_Medical_College_Hyderabad_Telangana_India.jpg/1280px-Osmania_Medical_College_Hyderabad_Telangana_India.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_02.jpg/1280px-MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_02.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_18.jpg/1280px-MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_18.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_14.jpg/1280px-MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_14.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_11.jpg/1280px-MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_11.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_12.jpg/1280px-MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_12.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_01.jpg/1280px-MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_01.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Government_E._N._T._Hospital_13.jpg/1280px-Government_E._N._T._Hospital_13.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Government_E._N._T._Hospital_6.jpg/1280px-Government_E._N._T._Hospital_6.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Government_E._N._T._Hospital_8.jpg/1280px-Government_E._N._T._Hospital_8.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Government_E._N._T._Hospital_9.jpg/1280px-Government_E._N._T._Hospital_9.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Government_E._N._T._Hospital_15.jpg/1280px-Government_E._N._T._Hospital_15.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Government_E._N._T._Hospital_23.jpg/1280px-Government_E._N._T._Hospital_23.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/e/ee/Gandhigram_government_hospital.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/4/4f/Special_Hospital_for_Corona_patients_2.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/7/70/Special_Hospital_for_Corona_patients.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Chennai_GEM_hospital.jpg/1280px-Chennai_GEM_hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Multi-Speciality-Hospital-Govt-Estate-Chennai-India.jpg/1280px-Multi-Speciality-Hospital-Govt-Estate-Chennai-India.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Vasan_eye_care_hospital_chennai_135633.jpg/1280px-Vasan_eye_care_hospital_chennai_135633.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Mahyco_Block_Building-_Sankara_Nethralaya%2C_College_Road.jpg/1280px-Mahyco_Block_Building-_Sankara_Nethralaya%2C_College_Road.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Government_Kasturba_Gandhi_Hospital_in_Chennai_01.jpg/1280px-Government_Kasturba_Gandhi_Hospital_in_Chennai_01.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Government_Kasturba_Gandhi_Hospital_in_Chennai_02.jpg/1280px-Government_Kasturba_Gandhi_Hospital_in_Chennai_02.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Government_Kasturba_Gandhi_Hospital_in_Chennai_03.jpg/1280px-Government_Kasturba_Gandhi_Hospital_in_Chennai_03.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Government_Peripheral_Hospital%2C_Periyar_Nagar%2C_Chennai.jpg/1280px-Government_Peripheral_Hospital%2C_Periyar_Nagar%2C_Chennai.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/GH_Chennai.JPG/1280px-GH_Chennai.JPG",
                "https://upload.wikimedia.org/wikipedia/commons/a/a3/ChennaiGH_Corridor.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Rajiv_Gandhi_Government_General_Hospital_in_Chennai.jpg/1280px-Rajiv_Gandhi_Government_General_Hospital_in_Chennai.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Rajiv_Gandhi_General_Hospital_Chennai_142003.jpg/1280px-Rajiv_Gandhi_General_Hospital_Chennai_142003.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/f/f3/GH_Tower_1_Front_Lobby.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/d/da/Omanthurar.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Fernandez_Hospital%2C_Hyderabad.jpg/1280px-Fernandez_Hospital%2C_Hyderabad.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Nova_ENT_Hospital_Hyderabad_01.jpg/1280px-Nova_ENT_Hospital_Hyderabad_01.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Nova_ENT_Hospital_Hyderabad_02.jpg/1280px-Nova_ENT_Hospital_Hyderabad_02.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/District_Hospital%2C_Hyderabad.JPG/1280px-District_Hospital%2C_Hyderabad.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Nampally_Area_Hospital%2C_Hyderabad.jpg/1280px-Nampally_Area_Hospital%2C_Hyderabad.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Victoria_Maternity_Hospital%2C_Hyderabad.jpg/1280px-Victoria_Maternity_Hospital%2C_Hyderabad.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Victoria_Maternity_Hospital%2C_Hyderabad_17.jpg/1280px-Victoria_Maternity_Hospital%2C_Hyderabad_17.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Victoria_Maternity_Hospital%2C_Hyderabad_7.jpg/1280px-Victoria_Maternity_Hospital%2C_Hyderabad_7.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Government_ENT_Hospital%2C_koti%2C_Hyderabad.jpg/1280px-Government_ENT_Hospital%2C_koti%2C_Hyderabad.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Military_Hospital%2C_Golconda%2C_Hyderabad.jpg/1280px-Military_Hospital%2C_Golconda%2C_Hyderabad.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Osmania_General_Hospital_Hyderabad_Telangana.jpg/1280px-Osmania_General_Hospital_Hyderabad_Telangana.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/Vani_Vilas_and_Victoria_Hospitals.jpg/1280px-Vani_Vilas_and_Victoria_Hospitals.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Sankara_Eye_Hospital_8-1-2010_4-51-27_PM.JPG/1280px-Sankara_Eye_Hospital_8-1-2010_4-51-27_PM.JPG",
                "https://upload.wikimedia.org/wikipedia/commons/2/24/Sri_Sathya_Sai_Super_Speciality_Hospital_Bangalore_%2848186333806%29.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/1/13/Bangalore_baptist_hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Wockhardt_hospital_bennargatta_road_bangalore.JPG/1280px-Wockhardt_hospital_bennargatta_road_bangalore.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Outer_View%2C_Narayana_Multispeciality_Hospital%2C_HSR_Layout.jpg/1280px-Outer_View%2C_Narayana_Multispeciality_Hospital%2C_HSR_Layout.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Vydehi_Hospital.jpg/1280px-Vydehi_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Dr._Agarwal%27s_Eye_Hospital_%282024%29_01.jpg/1280px-Dr._Agarwal%27s_Eye_Hospital_%282024%29_01.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Dr._Agarwal%27s_Eye_Hospital_%282024%29.jpg/1280px-Dr._Agarwal%27s_Eye_Hospital_%282024%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/K_L_Hospital.jpg/1280px-K_L_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Rashtrotthana_Hospital_and_Research_Centre_%282024%29.jpg/1280px-Rashtrotthana_Hospital_and_Research_Centre_%282024%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Narayana_Multispecialty_Hospital%2C_Whitefield.jpg/1280px-Narayana_Multispecialty_Hospital%2C_Whitefield.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Malya_hostpital.JPG/1280px-Malya_hostpital.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Sathya-Sai-Hospital-Whitefield-Bangalore.jpg/1280px-Sathya-Sai-Hospital-Whitefield-Bangalore.jpg",
                // ---- POOL 2: district expansion (all unique, verified) ----
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/District_hospital_Kanhangad.jpg/1280px-District_hospital_Kanhangad.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/District_hospital_Kanhangad_%2893350%29.jpg/1280px-District_hospital_Kanhangad_%2893350%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/District_hospital_Kanhangad_%2872355%29.jpg/1280px-District_hospital_Kanhangad_%2872355%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/District_hospital_Kanhangad_%2827738%29.jpg/1280px-District_hospital_Kanhangad_%2827738%29.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/a/a0/Darjeeling_District_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Darjeeling_District_Hospital%2C_Darjeeling_Dist.%2C_West_Bengal%2C_India_01.jpg/1280px-Darjeeling_District_Hospital%2C_Darjeeling_Dist.%2C_West_Bengal%2C_India_01.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Darjeeling_District_Hospital%2C_Darjeeling_Dist.%2C_West_Bengal%2C_India_02.jpg/1280px-Darjeeling_District_Hospital%2C_Darjeeling_Dist.%2C_West_Bengal%2C_India_02.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Darjeeling_District_Hospital%2C_Darjeeling_Dist.%2C_West_Bengal%2C_India_03.jpg/1280px-Darjeeling_District_Hospital%2C_Darjeeling_Dist.%2C_West_Bengal%2C_India_03.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Darjeeling_District_Hospital%2C_Darjeeling_Dist.%2C_West_Bengal%2C_India_04.jpg/1280px-Darjeeling_District_Hospital%2C_Darjeeling_Dist.%2C_West_Bengal%2C_India_04.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/ARATHANA_HOSPITAL_01.jpg/1280px-ARATHANA_HOSPITAL_01.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/1/14/ARATHANA_HOSPITAL_05.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Ayurveda_hospital%2C_Neyyattinkara%2C_Tvm_district_kerala_India.jpg/1280px-Ayurveda_hospital%2C_Neyyattinkara%2C_Tvm_district_kerala_India.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Iris_Hospital_-_82-1_Raja_Subodh_Chandra_Mullick_Road_-_Kolkata_2014-02-12_2037.JPG/1280px-Iris_Hospital_-_82-1_Raja_Subodh_Chandra_Mullick_Road_-_Kolkata_2014-02-12_2037.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Narayana_Multispeciality_Hospital_-_Hridaypur_-_Barasat_2017-05-10_7631.JPG/1280px-Narayana_Multispeciality_Hospital_-_Hridaypur_-_Barasat_2017-05-10_7631.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Sanjeevini_Multispeciality_Hospital%2C_Cheriyanad.jpg/1280px-Sanjeevini_Multispeciality_Hospital%2C_Cheriyanad.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/4/4e/Guntur_Kidney_%26_Multispeciality_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Asha_Niketan_Hospital%2C_Area_Colony_Bhopal.jpg/1280px-Asha_Niketan_Hospital%2C_Area_Colony_Bhopal.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Asha_Niketan_Hospital%2C_Area_Colony_Bhopal_2.jpg/1280px-Asha_Niketan_Hospital%2C_Area_Colony_Bhopal_2.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/R._G._Kar_Medical_College_%26_Hospital_during_Covid-19_02.jpg/1280px-R._G._Kar_Medical_College_%26_Hospital_during_Covid-19_02.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/R._G._Kar_Medical_College_%26_Hospital_during_Covid-19_01.jpg/1280px-R._G._Kar_Medical_College_%26_Hospital_during_Covid-19_01.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/J._B._Roy_State_Ayurvedic_Medical_College_%26_Hospital_02.jpg/1280px-J._B._Roy_State_Ayurvedic_Medical_College_%26_Hospital_02.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/J._B._Roy_State_Ayurvedic_Medical_College_%26_Hospital_03.jpg/1280px-J._B._Roy_State_Ayurvedic_Medical_College_%26_Hospital_03.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/J._B._Roy_State_Ayurvedic_Medical_College_%26_Hospital_01.jpg/1280px-J._B._Roy_State_Ayurvedic_Medical_College_%26_Hospital_01.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Burdwan_Homoeopathic_Medical_College_%26_Hospital_01.jpg/1280px-Burdwan_Homoeopathic_Medical_College_%26_Hospital_01.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Burdwan_Homoeopathic_Medical_College_%26_Hospital_02.jpg/1280px-Burdwan_Homoeopathic_Medical_College_%26_Hospital_02.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Burdwan_Homoeopathic_Medical_College_%26_Hospital_03.jpg/1280px-Burdwan_Homoeopathic_Medical_College_%26_Hospital_03.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Burdwan_Homoeopathic_Medical_College_%26_Hospital_04.jpg/1280px-Burdwan_Homoeopathic_Medical_College_%26_Hospital_04.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Main_building_of_Osmania_Medical_College.jpg/1280px-Main_building_of_Osmania_Medical_College.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Pariyaram_Medical_College_front_view_01.jpg/1280px-Pariyaram_Medical_College_front_view_01.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Christian_Medical_College.jpg/1280px-Christian_Medical_College.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Father_Muller_Medical_College_%2878828%29.jpg/1280px-Father_Muller_Medical_College_%2878828%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/Sardar_Patel_Medical_College_Bikaner.jpg/1280px-Sardar_Patel_Medical_College_Bikaner.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Building_in_Government_Medical_College%2C_Kollam.jpg/1280px-Building_in_Government_Medical_College%2C_Kollam.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Government_Ayurveda_Medical_College_Kannur.jpg/1280px-Government_Ayurveda_Medical_College_Kannur.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Kolkata_Medical_College_and_Hospital_gate_no_1.jpg/1280px-Kolkata_Medical_College_and_Hospital_gate_no_1.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Pramukhswami_Medical_College%2C_Anand%2C_India_%28Unsplash%29.jpg/1280px-Pramukhswami_Medical_College%2C_Anand%2C_India_%28Unsplash%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Coimbatore_Medical_College_Hospital_India_201.jpg/1280px-Coimbatore_Medical_College_Hospital_India_201.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/VSH_-_Advanced_Cancer_Care%2C_Chetpet.jpg/1280px-VSH_-_Advanced_Cancer_Care%2C_Chetpet.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Santhosh_hospitals%2C_Besant_Nagar.JPG/1280px-Santhosh_hospitals%2C_Besant_Nagar.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/Saidhapet_Governement_Hospital.JPG/1280px-Saidhapet_Governement_Hospital.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Saidhappettai_Government_Hospital.JPG/1280px-Saidhappettai_Government_Hospital.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Vaasan_Eye_care_hospital_1.JPG/1280px-Vaasan_Eye_care_hospital_1.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Vaasan_Eyecare_hospital_2.JPG/1280px-Vaasan_Eyecare_hospital_2.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Vadapalani_Vijaya_Hospital_27-05-2017.jpg/1280px-Vadapalani_Vijaya_Hospital_27-05-2017.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/5/5c/Dr.Agarwal_Eye_Hospital.JPG",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Telangana_Institute_Of_Medical_Secinces_TIMS_Santhanagar_Hyderabad_%2823193%29.jpg/1280px-Telangana_Institute_Of_Medical_Secinces_TIMS_Santhanagar_Hyderabad_%2823193%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Telangana_Institute_Of_Medical_Secinces_TIMS_Santhanagar_Hyderabad_%2814701%29.jpg/1280px-Telangana_Institute_Of_Medical_Secinces_TIMS_Santhanagar_Hyderabad_%2814701%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/A_View_of_Osmania_general_hospital.jpg/1280px-A_View_of_Osmania_general_hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Osmania_General_Hospital.jpg/1280px-Osmania_General_Hospital.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/f/f0/Osmania_General_Hospital%2C_Hyderabad.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Erragadda_MEntal_Hospital.jpg/1280px-Erragadda_MEntal_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Tarnaka_Hospital.jpg/1280px-Tarnaka_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Thumbay_Hospital.jpg/1280px-Thumbay_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Owisi_Hospital.jpg/1280px-Owisi_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/TSRTC_Hospital.jpg/1280px-TSRTC_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Hyderabad_Urology_and_Andrology_Hospital_02.jpg/1280px-Hyderabad_Urology_and_Andrology_Hospital_02.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Dr_Agarwals_Eye_Hospital_allwyn_x_signal_miyapur_hyd.jpg/1280px-Dr_Agarwals_Eye_Hospital_allwyn_x_signal_miyapur_hyd.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Babaji_Netralaya_Eye_Hospital.jpg/1280px-Babaji_Netralaya_Eye_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Panineeya_Dental_college_and_hospital.jpg/1280px-Panineeya_Dental_college_and_hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Urban_primary_Health_care_center%2C_Asif_nagar%2C_Hyderabad.jpg/1280px-Urban_primary_Health_care_center%2C_Asif_nagar%2C_Hyderabad.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/4/4d/Yashoda_Hospitals_Malakpet.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/9/93/Yashoda_Hospitals_Somajiguda.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Continental_Hospital_Nanakramguda_FD_Hyd.jpg/1280px-Continental_Hospital_Nanakramguda_FD_Hyd.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Continental_Hospital_at_Hyderabad.jpg/1280px-Continental_Hospital_at_Hyderabad.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Continental_Hospital_at_Hyderabad_2.jpg/1280px-Continental_Hospital_at_Hyderabad_2.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/Narayana_Institute_of_Cardiac_Sciences%2C_Bangalore%2C_Karnataka%2C_India_%282014%29_1.jpg/1280px-Narayana_Institute_of_Cardiac_Sciences%2C_Bangalore%2C_Karnataka%2C_India_%282014%29_1.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Narayana_health_Bangalore.jpg/1280px-Narayana_health_Bangalore.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/4/46/Vanivilas2.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/b/bd/Krishnadevaraya_College_of_Dental_Sciencess_Hospital_Bangalore.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Agara_Primary_Health_Centre.jpg/1280px-Agara_Primary_Health_Centre.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Rainbow_children%27s_hospital_Vja.jpg/1280px-Rainbow_children%27s_hospital_Vja.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Sai_Bhaskar_Hospitals.jpg/1280px-Sai_Bhaskar_Hospitals.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/7/71/Sai_Bhaskar_Hospitals%2CSuryaraopeta%2CVijayawada.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Suraksha_Hospitals.jpg/1280px-Suraksha_Hospitals.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Sunrise_Hospitals.jpg/1280px-Sunrise_Hospitals.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Ravi_Neuro_Center.jpg/1280px-Ravi_Neuro_Center.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Indo_American_Dental_Hospital.jpg/1280px-Indo_American_Dental_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/St_Aloysius_Nursing_home.jpg/1280px-St_Aloysius_Nursing_home.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Ananthapuri_Hospitals_and_Research_Institute.jpg/1280px-Ananthapuri_Hospitals_and_Research_Institute.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Mar_Augustine_Memorial_Lisie_Hospital.jpg/1280px-Mar_Augustine_Memorial_Lisie_Hospital.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/9/9f/Padmavathy_hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Rajagiri_Hospital.jpg/1280px-Rajagiri_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Rajagiri_Hospital_Kerala.jpg/1280px-Rajagiri_Hospital_Kerala.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Cherthala_Taluk_Hospital.jpg/1280px-Cherthala_Taluk_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Cherthala_Taluk_Hospital_2.jpg/1280px-Cherthala_Taluk_Hospital_2.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Cherthala_Taluk_Hospital_3.jpg/1280px-Cherthala_Taluk_Hospital_3.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Cherthala_Taluk_Hospital_4.jpg/1280px-Cherthala_Taluk_Hospital_4.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Perumbavoor_Taluk_Headquarters_Hospital.jpg/1280px-Perumbavoor_Taluk_Headquarters_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/General_Hospital_Alappuzha_2.jpg/1280px-General_Hospital_Alappuzha_2.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/General_Hospital_Alappuzha.jpg/1280px-General_Hospital_Alappuzha.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/TMM_Hospital_Tiruvalla.jpg/1280px-TMM_Hospital_Tiruvalla.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Lisie_Hospital%2CCochin%2Ckerala%2CIndia_-_panoramio.jpg/1280px-Lisie_Hospital%2CCochin%2Ckerala%2CIndia_-_panoramio.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/St_Gregorios_Medical_Mission_Hospital.jpg/1280px-St_Gregorios_Medical_Mission_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Parumala_Hospital.jpg/1280px-Parumala_Hospital.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Sp_multi-speciality_hospital%2C_Parassala_jn%2C_Kerala_Tamilnadu_Border.jpg/1280px-Sp_multi-speciality_hospital%2C_Parassala_jn%2C_Kerala_Tamilnadu_Border.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/7/70/Govt._Medical_College_Hospital_Parippally%2C_Kollam.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/District_hospital_Kanhangad_%2859959%29.jpg/1280px-District_hospital_Kanhangad_%2859959%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/District_hospital_Kanhangad_%2817185%29.jpg/1280px-District_hospital_Kanhangad_%2817185%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_05.jpg/1280px-MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_05.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Government_E._N._T._Hospital_3.jpg/1280px-Government_E._N._T._Hospital_3.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Kasturba_Hospital%2C_Manipal_-_views_around_%2810%29.jpg/1280px-Kasturba_Hospital%2C_Manipal_-_views_around_%2810%29.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_04.jpg/1280px-Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_04.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Victoria_Maternity_Hospital%2C_Hyderabad_10.jpg/1280px-Victoria_Maternity_Hospital%2C_Hyderabad_10.jpg",
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Victoria_Maternity_Hospital%2C_Hyderabad_12.jpg/1280px-Victoria_Maternity_Hospital%2C_Hyderabad_12.jpg"
        ));
        return pool;
    }

    @Bean
    @Order(40)
    CommandLineRunner assignRealHospitalImages(
            HospitalRepository hospitalRepository
    ) {
        return args -> {
            System.out.println("Assigning real hospital images...");

            Map<String, String> exact = exactImages();
            List<String> pool = poolImages();

            // Safety: pool itself must not contain duplicates.
            Set<String> seenPool = new LinkedHashSet<>(pool);
            if (seenPool.size() != pool.size()) {
                System.out.println("WARNING: pool contains duplicates, deduping.");
                pool = new ArrayList<>(seenPool);
            }

            List<Hospital> hospitals = hospitalRepository.findAll(
                    Sort.by(Sort.Direction.ASC, "id"));

            // URLs already taken (exact map wins first).
            Set<String> used = new LinkedHashSet<>(exact.values());

            int exactCount = 0;
            int poolCount = 0;
            int poolIndex = 0;

            for (Hospital hospital : hospitals) {
                String current = hospital.getImageUrl();

                // Never touch administrator-uploaded local images.
                if (current != null && !current.isBlank()
                        && !current.startsWith("http")) {
                    continue;
                }

                String target = exact.get(key(hospital.getName(), hospital.getCity()));

                if (target != null) {
                    if (!target.equals(current)) {
                        hospital.setImageUrl(target);
                        hospitalRepository.save(hospital);
                    }
                    exactCount++;
                    continue;
                }

                // Unique pool photo, never reused.
                String candidate = null;
                while (poolIndex < pool.size()) {
                    String next = pool.get(poolIndex++);
                    if (!used.contains(next)) {
                        candidate = next;
                        break;
                    }
                }

                if (candidate == null) {
                    // Pool exhausted (e.g. future admin-added hospitals):
                    // keep whatever image exists rather than duplicating.
                    System.out.println("Real-image pool exhausted for hospital id="
                            + hospital.getId() + "; keeping current image.");
                    continue;
                }

                used.add(candidate);
                if (!candidate.equals(current)) {
                    hospital.setImageUrl(candidate);
                    hospitalRepository.save(hospital);
                }
                poolCount++;
            }

            System.out.println("Real images assigned — exact: " + exactCount
                    + ", unique pool: " + poolCount
                    + ", hospitals: " + hospitals.size());
        };
    }
}
