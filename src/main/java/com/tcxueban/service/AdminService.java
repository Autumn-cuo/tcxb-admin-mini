package com.tcxueban.service;

import com.tcxueban.entity.Admin;
import com.tcxueban.entity.User;

import java.util.List;

public interface AdminService {

    Admin login(String adminAccount, String password);

    List<User> getAllUsers();

    boolean updateUserStatus(Integer userId, Integer accountStatus);
}