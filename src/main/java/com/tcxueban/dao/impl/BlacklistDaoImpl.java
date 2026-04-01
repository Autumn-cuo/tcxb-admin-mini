package com.tcxueban.dao.impl;

import com.tcxueban.dao.BlacklistDao;
import com.tcxueban.entity.BlacklistRecord;
import com.tcxueban.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class BlacklistDaoImpl implements BlacklistDao {

    @Override
    public int addBlacklist(BlacklistRecord blacklistRecord) {
        String sql = "INSERT INTO blacklist_record " +
                "(user_id, blocked_user_id, reason, blacklist_status) " +
                "VALUES (?, ?, ?, ?)";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, blacklistRecord.getUserId());
            ps.setInt(2, blacklistRecord.getBlockedUserId());
            ps.setString(3, blacklistRecord.getReason());
            ps.setInt(4, blacklistRecord.getBlacklistStatus());

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public List<BlacklistRecord> getBlacklistByUserId(Integer userId) {
        List<BlacklistRecord> list = new ArrayList<>();

        String sql = "SELECT blacklist_id, user_id, blocked_user_id, reason, blacklist_status, created_at, removed_at " +
                "FROM blacklist_record " +
                "WHERE user_id = ? AND blacklist_status = 0 " +
                "ORDER BY created_at DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    BlacklistRecord record = new BlacklistRecord();
                    record.setBlacklistId(rs.getInt("blacklist_id"));
                    record.setUserId(rs.getInt("user_id"));
                    record.setBlockedUserId(rs.getInt("blocked_user_id"));
                    record.setReason(rs.getString("reason"));
                    record.setBlacklistStatus(rs.getInt("blacklist_status"));
                    record.setCreatedAt(rs.getTimestamp("created_at"));
                    record.setRemovedAt(rs.getTimestamp("removed_at"));
                    list.add(record);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    @Override
    public int removeBlacklist(Integer userId, Integer blockedUserId) {
        String sql = "UPDATE blacklist_record " +
                "SET blacklist_status = 1, removed_at = NOW() " +
                "WHERE user_id = ? AND blocked_user_id = ? AND blacklist_status = 0";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, blockedUserId);

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
}