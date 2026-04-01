package com.tcxueban.dao;

import com.tcxueban.entity.Admin;
import com.tcxueban.entity.User;

import java.util.List;

public interface AdminDao {

    Admin findByAccount(String adminAccount);

    int updateLastLoginTime(Integer adminId);

    List<User> getAllUsers();

    int updateUserStatus(Integer userId, Integer accountStatus);
}