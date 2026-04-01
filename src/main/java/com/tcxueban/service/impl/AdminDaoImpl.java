package com.tcxueban.dao.impl;

import com.tcxueban.dao.AdminDao;
import com.tcxueban.entity.Admin;
import com.tcxueban.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.tcxueban.entity.User;
import java.util.ArrayList;
import java.util.List;

public class AdminDaoImpl implements AdminDao {

    @Override
    public Admin findByAccount(String adminAccount) {
        String sql = "SELECT admin_id, admin_account, admin_name, password_hash, " +
                "admin_status, last_login_time, created_at " +
                "FROM admin WHERE admin_account = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, adminAccount);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Admin admin = new Admin();
                    admin.setAdminId(rs.getInt("admin_id"));
                    admin.setAdminAccount(rs.getString("admin_account"));
                    admin.setAdminName(rs.getString("admin_name"));
                    admin.setPasswordHash(rs.getString("password_hash"));
                    admin.setAdminStatus(rs.getInt("admin_status"));
                    admin.setLastLoginTime(rs.getTimestamp("last_login_time"));
                    admin.setCreatedAt(rs.getTimestamp("created_at"));
                    return admin;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    @Override
    public int updateLastLoginTime(Integer adminId) {
        String sql = "UPDATE admin SET last_login_time = NOW() WHERE admin_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, adminId);
            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public List<User> getAllUsers() {
        List<User> list = new ArrayList<>();

        String sql = "SELECT user_id, student_no, real_name, nickname, school_email, " +
                "gender, major, grade, account_status, role_type, trust_score, created_at, updated_at " +
                "FROM user ORDER BY created_at DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                User user = new User();
                user.setUserId(rs.getInt("user_id"));
                user.setStudentNo(rs.getString("student_no"));
                user.setRealName(rs.getString("real_name"));
                user.setNickname(rs.getString("nickname"));
                user.setSchoolEmail(rs.getString("school_email"));
                user.setGender(rs.getString("gender"));
                user.setMajor(rs.getString("major"));
                user.setGrade(rs.getString("grade"));
                user.setAccountStatus(rs.getInt("account_status"));
                user.setRoleType(rs.getInt("role_type"));
                user.setTrustScore(rs.getInt("trust_score"));
                user.setCreatedAt(rs.getTimestamp("created_at"));
                user.setUpdatedAt(rs.getTimestamp("updated_at"));
                list.add(user);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    @Override
    public int updateUserStatus(Integer userId, Integer accountStatus) {
        String sql = "UPDATE user SET account_status = ? WHERE user_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, accountStatus);
            ps.setInt(2, userId);
            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
}