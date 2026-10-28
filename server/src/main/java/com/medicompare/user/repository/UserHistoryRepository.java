package com.medicompare.user.repository;

import com.medicompare.user.entity.User;
import com.medicompare.user.entity.UserHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserHistoryRepository
        extends JpaRepository<UserHistory, Long> {

    List<UserHistory> findTop20ByUserOrderByViewedAtDesc(
            User user
    );

    void deleteByUser(User user);
}