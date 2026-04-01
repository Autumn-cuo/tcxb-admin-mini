package com.tcxueban.dao.impl;

import com.tcxueban.dao.PartnerRelationDao;
import com.tcxueban.entity.PartnerRelation;
import com.tcxueban.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PartnerRelationDaoImpl implements PartnerRelationDao {

    @Override
    public int addRelation(PartnerRelation relation) {
        String sql = "INSERT INTO partner_relation (user_id_a, user_id_b, course, progress_current, progress_total, relation_status) " +
                "VALUES (?, ?, ?, 0, 12, 0)";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, relation.getUserIdA());
            ps.setInt(2, relation.getUserIdB());
            ps.setString(3, relation.getCourse());

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public List<PartnerRelation> getMyRelations(Integer userId) {
        List<PartnerRelation> list = new ArrayList<>();

        // 查询 userId 在 A 或 B 位置的活跃关系，JOIN 出对方信息
        String sql = "SELECT pr.relation_id, pr.user_id_a, pr.user_id_b, pr.course, " +
                "pr.progress_current, pr.progress_total, pr.relation_status, pr.created_at, " +
                "CASE WHEN pr.user_id_a = ? THEN ub.real_name ELSE ua.real_name END AS partner_name, " +
                "CASE WHEN pr.user_id_a = ? THEN ub.trust_score ELSE ua.trust_score END AS partner_trust_score, " +
                "CASE WHEN pr.user_id_a = ? THEN pr.user_id_b ELSE pr.user_id_a END AS partner_user_id " +
                "FROM partner_relation pr " +
                "JOIN user ua ON ua.user_id = pr.user_id_a " +
                "JOIN user ub ON ub.user_id = pr.user_id_b " +
                "WHERE (pr.user_id_a = ? OR pr.user_id_b = ?) AND pr.relation_status = 0 " +
                "ORDER BY pr.created_at DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, userId);
            ps.setInt(3, userId);
            ps.setInt(4, userId);
            ps.setInt(5, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PartnerRelation relation = new PartnerRelation();
                    relation.setRelationId(rs.getInt("relation_id"));
                    relation.setUserIdA(rs.getInt("user_id_a"));
                    relation.setUserIdB(rs.getInt("user_id_b"));
                    relation.setCourse(rs.getString("course"));
                    relation.setProgressCurrent(rs.getInt("progress_current"));
                    relation.setProgressTotal(rs.getInt("progress_total"));
                    relation.setRelationStatus(rs.getInt("relation_status"));
                    relation.setCreatedAt(rs.getTimestamp("created_at"));
                    relation.setPartnerName(rs.getString("partner_name"));
                    relation.setPartnerTrustScore(rs.getInt("partner_trust_score"));
                    relation.setPartnerUserId(rs.getInt("partner_user_id"));
                    list.add(relation);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    @Override
    public int updateProgress(Integer relationId, Integer progressCurrent) {
        String sql = "UPDATE partner_relation SET progress_current = ? WHERE relation_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, progressCurrent);
            ps.setInt(2, relationId);

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public int endRelation(Integer relationId) {
        String sql = "UPDATE partner_relation SET relation_status = 1 WHERE relation_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, relationId);

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public boolean exists(Integer userIdA, Integer userIdB) {
        String sql = "SELECT COUNT(*) FROM partner_relation " +
                "WHERE ((user_id_a = ? AND user_id_b = ?) OR (user_id_a = ? AND user_id_b = ?)) " +
                "AND relation_status = 0";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userIdA);
            ps.setInt(2, userIdB);
            ps.setInt(3, userIdB);
            ps.setInt(4, userIdA);

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
