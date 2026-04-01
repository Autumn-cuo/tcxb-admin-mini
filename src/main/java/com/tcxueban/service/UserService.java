package com.tcxueban.service;

import com.tcxueban.entity.User;

public interface UserService {

    User register(String studentNo, String realName, String major, String grade,
                  String schoolEmail, String password);

    User login(String schoolEmail, String password);

    User getInfo(Integer userId);

    boolean updateProfile(Integer userId, String realName, String major, String grade,
                          String preferredCourses, String preferredTimes, String preferredPlaces);
}
