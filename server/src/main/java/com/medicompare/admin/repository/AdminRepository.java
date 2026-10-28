package com.medicompare.admin.repository;

import com.medicompare.admin.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}