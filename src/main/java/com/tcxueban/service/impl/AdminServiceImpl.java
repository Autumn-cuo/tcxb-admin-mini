package com.tcxueban.service.impl;

import com.tcxueban.dao.AdminDao;
import com.tcxueban.dao.impl.AdminDaoImpl;
import com.tcxueban.entity.Admin;
import com.tcxueban.service.AdminService;

import com.tcxueban.entity.User;
import java.util.List;

public class AdminServiceImpl implements AdminService {

    private final AdminDao adminDao = new AdminDaoImpl();

    @Override
    public Admin login(String adminAccount, String password) {
        if (adminAccount == null || adminAccount.trim().isEmpty()) {
            return null;
        }

        if (password == null || password.trim().isEmpty()) {
            return null;
        }

        Admin admin = adminDao.findByAccount(adminAccount);
        if (admin == null) {
            return null;
        }

        if (admin.getAdminStatus() == null || admin.getAdminStatus() != 0) {
            return null;
        }

        if (!password.equals(admin.getPasswordHash())) {
            return null;
        }

        adminDao.updateLastLoginTime(admin.getAdminId());
        return admin;
    }

    @Override
    public List<User> getAllUsers() {
        return adminDao.getAllUsers();
    }

    @Override
    public boolean updateUserStatus(Integer userId, Integer accountStatus) {
        if (userId == null || accountStatus == null) {
            return false;
        }

        if (accountStatus < 0 || accountStatus > 2) {
            return false;
        }

        return adminDao.updateUserStatus(userId, accountStatus) > 0;
    }
}