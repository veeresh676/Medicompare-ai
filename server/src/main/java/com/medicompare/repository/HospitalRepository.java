package com.medicompare.repository;

import com.medicompare.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface HospitalRepository
        extends JpaRepository<Hospital, Long>,
                JpaSpecificationExecutor<Hospital> {

    List<Hospital> findByCityIgnoreCase(String city);

    List<Hospital> findByStateIgnoreCase(String state);

    List<Hospital> findByNameIgnoreCaseAndCityIgnoreCase(String name, String city);
}