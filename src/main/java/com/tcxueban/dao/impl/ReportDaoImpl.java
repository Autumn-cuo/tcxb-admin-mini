package com.tcxueban.dao.impl;

import com.tcxueban.dao.ReportDao;
import com.tcxueban.entity.ReportRecord;
import com.tcxueban.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ReportDaoImpl implements ReportDao {

    @Override
    public int addReport(ReportRecord reportRecord) {
        String sql = "INSERT INTO report_record " +
                "(reporter_user_id, reported_user_id, report_reason, report_detail, evidence_url, evidence_name, report_status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, reportRecord.getReporterUserId());
            ps.setInt(2, reportRecord.getReportedUserId());
            ps.setString(3, reportRecord.getReportReason());
            ps.setString(4, reportRecord.getReportDetail());
            ps.setString(5, reportRecord.getEvidenceUrl());
            ps.setString(6, reportRecord.getEvidenceName());
            ps.setInt(7, reportRecord.getReportStatus());

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public List<ReportRecord> getReportsByReporterUserId(Integer reporterUserId) {
        List<ReportRecord> list = new ArrayList<>();

        String sql = "SELECT report_id, reporter_user_id, reported_user_id, report_reason, " +
                "report_detail, evidence_url, evidence_name, report_status, handled_by, " +
                "handle_result, report_time, handle_time " +
                "FROM report_record WHERE reporter_user_id = ? ORDER BY report_time DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, reporterUserId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ReportRecord record = new ReportRecord();
                    record.setReportId(rs.getInt("report_id"));
                    record.setReporterUserId(rs.getInt("reporter_user_id"));
                    record.setReportedUserId(rs.getInt("reported_user_id"));
                    record.setReportReason(rs.getString("report_reason"));
                    record.setReportDetail(rs.getString("report_detail"));
                    record.setEvidenceUrl(rs.getString("evidence_url"));
                    record.setEvidenceName(rs.getString("evidence_name"));
                    record.setReportStatus(rs.getInt("report_status"));
                    record.setHandledBy((Integer) rs.getObject("handled_by"));
                    record.setHandleResult(rs.getString("handle_result"));
                    record.setReportTime(rs.getTimestamp("report_time"));
                    record.setHandleTime(rs.getTimestamp("handle_time"));
                    list.add(record);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    @Override
    public List<ReportRecord> getAllReports() {
        List<ReportRecord> list = new ArrayList<>();

        String sql = "SELECT report_id, reporter_user_id, reported_user_id, report_reason, " +
                "report_detail, evidence_url, evidence_name, report_status, handled_by, " +
                "handle_result, report_time, handle_time " +
                "FROM report_record ORDER BY report_time DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                ReportRecord record = new ReportRecord();
                record.setReportId(rs.getInt("report_id"));
                record.setReporterUserId(rs.getInt("reporter_user_id"));
                record.setReportedUserId(rs.getInt("reported_user_id"));
                record.setReportReason(rs.getString("report_reason"));
                record.setReportDetail(rs.getString("report_detail"));
                record.setEvidenceUrl(rs.getString("evidence_url"));
                record.setEvidenceName(rs.getString("evidence_name"));
                record.setReportStatus(rs.getInt("report_status"));
                record.setHandledBy((Integer) rs.getObject("handled_by"));
                record.setHandleResult(rs.getString("handle_result"));
                record.setReportTime(rs.getTimestamp("report_time"));
                record.setHandleTime(rs.getTimestamp("handle_time"));
                list.add(record);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    @Override
    public int handleReport(Integer reportId, Integer handledBy, String handleResult, Integer reportStatus) {
        String sql = "UPDATE report_record " +
                "SET handled_by = ?, handle_result = ?, report_status = ?, handle_time = NOW() " +
                "WHERE report_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, handledBy);
            ps.setString(2, handleResult);
            ps.setInt(3, reportStatus);
            ps.setInt(4, reportId);

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
}

