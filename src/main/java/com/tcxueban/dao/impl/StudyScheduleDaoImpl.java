package com.tcxueban.dao.impl;

import com.tcxueban.dao.StudyScheduleDao;
import com.tcxueban.entity.StudySchedule;
import com.tcxueban.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class StudyScheduleDaoImpl implements StudyScheduleDao {

    @Override
    public int addSchedule(StudySchedule schedule) {
        String sql = "INSERT INTO study_schedule (user_id_a, user_id_b, course, study_date, study_time, study_place, schedule_status) " +
                "VALUES (?, ?, ?, ?, ?, ?, 0)";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, schedule.getUserIdA());
            ps.setInt(2, schedule.getUserIdB());
            ps.setString(3, schedule.getCourse());
            ps.setString(4, schedule.getStudyDate());
            ps.setString(5, schedule.getStudyTime());
            ps.setString(6, schedule.getStudyPlace());

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public List<StudySchedule> getUpcomingByUserId(Integer userId) {
        List<StudySchedule> list = new ArrayList<>();

        String sql = "SELECT ss.schedule_id, ss.user_id_a, ss.user_id_b, ss.course, " +
                "DATE_FORMAT(ss.study_date, '%Y-%m-%d') AS study_date, ss.study_time, ss.study_place, " +
                "ss.schedule_status, ss.created_at, " +
                "CASE WHEN ss.user_id_a = ? THEN ub.real_name ELSE ua.real_name END AS partner_name, " +
                "CASE WHEN ss.user_id_a = ? THEN ss.user_id_b ELSE ss.user_id_a END AS partner_user_id " +
                "FROM study_schedule ss " +
                "JOIN user ua ON ua.user_id = ss.user_id_a " +
                "JOIN user ub ON ub.user_id = ss.user_id_b " +
                "WHERE (ss.user_id_a = ? OR ss.user_id_b = ?) AND ss.schedule_status = 0 " +
                "ORDER BY ss.study_date ASC, ss.study_time ASC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, userId);
            ps.setInt(3, userId);
            ps.setInt(4, userId);

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
    public List<StudySchedule> getHistoryByUserId(Integer userId) {
        List<StudySchedule> list = new ArrayList<>();

        String sql = "SELECT ss.schedule_id, ss.user_id_a, ss.user_id_b, ss.course, " +
                "DATE_FORMAT(ss.study_date, '%Y-%m-%d') AS study_date, ss.study_time, ss.study_place, " +
                "ss.schedule_status, ss.created_at, " +
                "CASE WHEN ss.user_id_a = ? THEN ub.real_name ELSE ua.real_name END AS partner_name, " +
                "CASE WHEN ss.user_id_a = ? THEN ss.user_id_b ELSE ss.user_id_a END AS partner_user_id, " +
                "cr.score " +
                "FROM study_schedule ss " +
                "JOIN user ua ON ua.user_id = ss.user_id_a " +
                "JOIN user ub ON ub.user_id = ss.user_id_b " +
                "LEFT JOIN checkin_record cr ON cr.schedule_id = ss.schedule_id AND cr.user_id = ? " +
                "WHERE (ss.user_id_a = ? OR ss.user_id_b = ?) AND ss.schedule_status = 1 " +
                "ORDER BY ss.study_date DESC, ss.study_time DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, userId);
            ps.setInt(3, userId);
            ps.setInt(4, userId);
            ps.setInt(5, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    StudySchedule schedule = mapRow(rs, true);
                    list.add(schedule);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    @Override
    public int updateStatus(Integer scheduleId, Integer status) {
        String sql = "UPDATE study_schedule SET schedule_status = ? WHERE schedule_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, status);
            ps.setInt(2, scheduleId);

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    private StudySchedule mapRow(ResultSet rs, boolean includeScore) throws SQLException {
        StudySchedule schedule = new StudySchedule();
        schedule.setScheduleId(rs.getInt("schedule_id"));
        schedule.setUserIdA(rs.getInt("user_id_a"));
        schedule.setUserIdB(rs.getInt("user_id_b"));
        schedule.setCourse(rs.getString("course"));
        schedule.setStudyDate(rs.getString("study_date"));
        schedule.setStudyTime(rs.getString("study_time"));
        schedule.setStudyPlace(rs.getString("study_place"));
        schedule.setScheduleStatus(rs.getInt("schedule_status"));
        schedule.setCreatedAt(rs.getTimestamp("created_at"));
        schedule.setPartnerName(rs.getString("partner_name"));
        schedule.setPartnerUserId(rs.getInt("partner_user_id"));
        if (includeScore) {
            double score = rs.getDouble("score");
            schedule.setScore(rs.wasNull() ? 5.0 : score);
        }
        return schedule;
    }
}
