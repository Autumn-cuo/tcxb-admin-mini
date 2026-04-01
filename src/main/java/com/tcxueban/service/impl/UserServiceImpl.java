package com.tcxueban.service.impl;

import com.tcxueban.dao.UserDao;
import com.tcxueban.dao.impl.UserDaoImpl;
import com.tcxueban.entity.User;
import com.tcxueban.service.UserService;

public class UserServiceImpl implements UserService {

    private final UserDao userDao = new UserDaoImpl();

    @Override
    public User register(String studentNo, String realName, String major, String grade,
                         String schoolEmail, String password) {
        if (studentNo == null || studentNo.trim().isEmpty()) return null;
        if (realName == null || realName.trim().isEmpty()) return null;
        if (schoolEmail == null || schoolEmail.trim().isEmpty()) return null;
        if (password == null || password.trim().isEmpty()) return null;

        // 检查邮箱是否已注册
        if (userDao.findByEmail(schoolEmail) != null) {
            return null;
        }

        User user = new User();
        user.setStudentNo(studentNo.trim());
        user.setRealName(realName.trim());
        user.setNickname(realName.trim());
        user.setSchoolEmail(schoolEmail.trim());
        user.setPasswordHash(password);
        user.setMajor(major != null ? major.trim() : "");
        user.setGrade(grade != null ? grade.trim() : "");
        user.setPreferredCourses("");
        user.setPreferredTimes("");
        user.setPreferredPlaces("");

        int rows = userDao.register(user);
        if (rows > 0) {
            return userDao.findByEmail(schoolEmail);
        }
        return null;
    }

    @Override
    public User login(String schoolEmail, String password) {
        if (schoolEmail == null || schoolEmail.trim().isEmpty()) return null;
        if (password == null || password.trim().isEmpty()) return null;

        User user = userDao.findByEmail(schoolEmail);
        if (user == null) return null;

        // 账号状态检查：封禁（2）不能登录
        if (user.getAccountStatus() != null && user.getAccountStatus() == 2) return null;

        if (!password.equals(user.getPasswordHash())) return null;

        return user;
    }

    @Override
    public User getInfo(Integer userId) {
        if (userId == null) return null;
        return userDao.findById(userId);
    }

    @Override
    public boolean updateProfile(Integer userId, String realName, String major, String grade,
                                 String preferredCourses, String preferredTimes, String preferredPlaces) {
        if (userId == null) return false;
        if (realName == null || realName.trim().isEmpty()) return false;

        return userDao.updateProfile(userId, realName.trim(), major, grade,
                preferredCourses, preferredTimes, preferredPlaces) > 0;
    }
}
