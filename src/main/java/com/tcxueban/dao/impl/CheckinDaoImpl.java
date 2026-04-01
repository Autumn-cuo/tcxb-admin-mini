package com.tcxueban.dao.impl;

import com.tcxueban.dao.CheckinDao;
import com.tcxueban.entity.CheckinRecord;
import com.tcxueban.util.DBUtil;

import java.sql.*;

public class CheckinDaoImpl implements CheckinDao {

    @Override
    public int addCheckin(CheckinRecord record) {
        String sql = "INSERT INTO checkin_record (schedule_id, user_id, score) VALUES (?, ?, ?)";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, record.getScheduleId());
            ps.setInt(2, record.getUserId());
            ps.setDouble(3, record.getScore() != null ? record.getScore() : 5.0);

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public boolean hasCheckedIn(Integer scheduleId, Integer userId) {
        String sql = "SELECT COUNT(*) FROM checkin_record WHERE schedule_id = ? AND user_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, scheduleId);
            ps.setInt(2, userId);

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
}
