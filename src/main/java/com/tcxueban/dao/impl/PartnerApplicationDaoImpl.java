package com.tcxueban.dao.impl;

import com.tcxueban.dao.PartnerApplicationDao;
import com.tcxueban.entity.PartnerApplication;
import com.tcxueban.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PartnerApplicationDaoImpl implements PartnerApplicationDao {

    @Override
    public int addApplication(PartnerApplication application) {
        String sql = "INSERT INTO partner_application (applicant_user_id, target_user_id, message, apply_status) " +
                "VALUES (?, ?, ?, 0)";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, application.getApplicantUserId());
            ps.setInt(2, application.getTargetUserId());
            ps.setString(3, application.getMessage());

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public List<PartnerApplication> getApplied(Integer applicantUserId) {
        List<PartnerApplication> list = new ArrayList<>();

        String sql = "SELECT pa.apply_id, pa.applicant_user_id, pa.target_user_id, pa.message, " +
                "pa.apply_status, pa.apply_time, pa.handle_time, u.real_name AS target_name " +
                "FROM partner_application pa " +
                "JOIN user u ON u.user_id = pa.target_user_id " +
                "WHERE pa.applicant_user_id = ? ORDER BY pa.apply_time DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, applicantUserId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs, false));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    @Override
    public List<PartnerApplication> getReceived(Integer targetUserId) {
        List<PartnerApplication> list = new ArrayList<>();

        String sql = "SELECT pa.apply_id, pa.applicant_user_id, pa.target_user_id, pa.message, " +
                "pa.apply_status, pa.apply_time, pa.handle_time, u.real_name AS applicant_name " +
                "FROM partner_application pa " +
                "JOIN user u ON u.user_id = pa.applicant_user_id " +
                "WHERE pa.target_user_id = ? AND pa.apply_status = 0 " +
                "ORDER BY pa.apply_time DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, targetUserId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs, true));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    @Override
    public int handleApplication(Integer applyId, Integer applyStatus) {
        String sql = "UPDATE partner_application SET apply_status = ?, handle_time = NOW() WHERE apply_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, applyStatus);
            ps.setInt(2, applyId);

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public boolean exists(Integer applicantUserId, Integer targetUserId) {
        String sql = "SELECT COUNT(*) FROM partner_application " +
                "WHERE applicant_user_id = ? AND target_user_id = ? AND apply_status = 0";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, applicantUserId);
            ps.setInt(2, targetUserId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    private PartnerApplication mapRow(ResultSet rs, boolean isReceived) throws SQLException {
        PartnerApplication app = new PartnerApplication();
        app.setApplyId(rs.getInt("apply_id"));
        app.setApplicantUserId(rs.getInt("applicant_user_id"));
        app.setTargetUserId(rs.getInt("target_user_id"));
        app.setMessage(rs.getString("message"));
        app.setApplyStatus(rs.getInt("apply_status"));
        app.setApplyTime(rs.getTimestamp("apply_time"));
        app.setHandleTime(rs.getTimestamp("handle_time"));
        if (isReceived) {
            app.setApplicantName(rs.getString("applicant_name"));
        } else {
            app.setTargetName(rs.getString("target_name"));
        }
        return app;
    }
}
