package com.tcxueban.dao.impl;

import com.tcxueban.dao.UserDao;
import com.tcxueban.entity.User;
import com.tcxueban.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDaoImpl implements UserDao {

    @Override
    public int register(User user) {
        String sql = "INSERT INTO user (student_no, real_name, nickname, school_email, password_hash, " +
                "major, grade, account_status, role_type, trust_score, preferred_courses, preferred_times, preferred_places) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 100, '', '', '')";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, user.getStudentNo());
            ps.setString(2, user.getRealName());
            ps.setString(3, user.getNickname() != null ? user.getNickname() : user.getRealName());
            ps.setString(4, user.getSchoolEmail());
            ps.setString(5, user.getPasswordHash());
            ps.setString(6, user.getMajor());
            ps.setString(7, user.getGrade());

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public User findByEmail(String schoolEmail) {
        String sql = "SELECT user_id, student_no, real_name, nickname, school_email, password_hash, " +
                "gender, major, grade, account_status, role_type, trust_score, " +
                "preferred_courses, preferred_times, preferred_places, created_at, updated_at " +
                "FROM user WHERE school_email = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, schoolEmail);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    @Override
    public User findById(Integer userId) {
        String sql = "SELECT user_id, student_no, real_name, nickname, school_email, password_hash, " +
                "gender, major, grade, account_status, role_type, trust_score, " +
                "preferred_courses, preferred_times, preferred_places, created_at, updated_at " +
                "FROM user WHERE user_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    @Override
    public int updateProfile(Integer userId, String realName, String major, String grade,
                             String preferredCourses, String preferredTimes, String preferredPlaces) {
        String sql = "UPDATE user SET real_name = ?, major = ?, grade = ?, " +
                "preferred_courses = ?, preferred_times = ?, preferred_places = ? " +
                "WHERE user_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, realName);
            ps.setString(2, major);
            ps.setString(3, grade);
            ps.setString(4, preferredCourses != null ? preferredCourses : "");
            ps.setString(5, preferredTimes != null ? preferredTimes : "");
            ps.setString(6, preferredPlaces != null ? preferredPlaces : "");
            ps.setInt(7, userId);

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public int updateTrustScore(Integer userId, Integer delta) {
        // 将信誉分加 delta，并保证在 0-100 范围内
        String sql = "UPDATE user SET trust_score = GREATEST(0, LEAST(100, trust_score + ?)) WHERE user_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, delta);
            ps.setInt(2, userId);

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public List<User> getAllExcept(Integer userId) {
        List<User> list = new ArrayList<>();

        String sql = "SELECT user_id, student_no, real_name, nickname, school_email, " +
                "gender, major, grade, account_status, role_type, trust_score, " +
                "preferred_courses, preferred_times, preferred_places, created_at, updated_at " +
                "FROM user WHERE user_id != ? AND account_status = 0 ORDER BY trust_score DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    private User mapRow(ResultSet rs) throws SQLException {
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
        user.setPreferredCourses(rs.getString("preferred_courses"));
        user.setPreferredTimes(rs.getString("preferred_times"));
        user.setPreferredPlaces(rs.getString("preferred_places"));
        user.setCreatedAt(rs.getTimestamp("created_at"));
        user.setUpdatedAt(rs.getTimestamp("updated_at"));
        return user;
    }
}
