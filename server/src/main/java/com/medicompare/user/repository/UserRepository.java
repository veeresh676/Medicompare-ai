package com.medicompare.user.repository;

import com.medicompare.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByResetToken(String resetToken);

    boolean existsByEmailIgnoreCase(String email);
}