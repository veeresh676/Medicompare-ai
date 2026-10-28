package com.medicompare.user.repository;

import com.medicompare.user.entity.User;
import com.medicompare.user.entity.UserFavourite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFavouriteRepository
        extends JpaRepository<UserFavourite, Long> {

    List<UserFavourite> findByUserOrderByCreatedAtDesc(
            User user
    );

    Optional<UserFavourite> findByUserIdAndHospitalId(
            Long userId,
            Long hospitalId
    );

    boolean existsByUserIdAndHospitalId(
            Long userId,
            Long hospitalId
    );

    void deleteByUserIdAndHospitalId(
            Long userId,
            Long hospitalId
    );
}