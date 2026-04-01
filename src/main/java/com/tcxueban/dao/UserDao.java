package com.tcxueban.dao;

import com.tcxueban.entity.User;

import java.util.List;

public interface UserDao {

    int register(User user);

    User findByEmail(String schoolEmail);

    User findById(Integer userId);

    int updateProfile(Integer userId, String realName, String major, String grade,
                      String preferredCourses, String preferredTimes, String preferredPlaces);

    int updateTrustScore(Integer userId, Integer delta);

    List<User> getAllExcept(Integer userId);
}
