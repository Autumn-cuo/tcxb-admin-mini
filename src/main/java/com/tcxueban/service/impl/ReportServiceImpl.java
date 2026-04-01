package com.tcxueban.service.impl;

import com.tcxueban.dao.ReportDao;
import com.tcxueban.dao.impl.ReportDaoImpl;
import com.tcxueban.entity.ReportRecord;
import com.tcxueban.service.ReportService;

import java.util.Collections;
import java.util.List;

public class ReportServiceImpl implements ReportService {

    private final ReportDao reportDao = new ReportDaoImpl();

    @Override
    public boolean submitReport(ReportRecord reportRecord) {
        if (reportRecord == null) {
            return false;
        }

        if (reportRecord.getReporterUserId() == null || reportRecord.getReportedUserId() == null) {
            return false;
        }

        if (reportRecord.getReportReason() == null || reportRecord.getReportReason().trim().isEmpty()) {
            return false;
        }

        if (reportRecord.getReporterUserId().equals(reportRecord.getReportedUserId())) {
            return false;
        }

        if (reportRecord.getReportStatus() == null) {
            reportRecord.setReportStatus(0);
        }

        return reportDao.addReport(reportRecord) > 0;
    }

    @Override
    public List<ReportRecord> getMyReports(Integer reporterUserId) {
        if (reporterUserId == null) {
            return Collections.emptyList();
        }
        return reportDao.getReportsByReporterUserId(reporterUserId);
    }

    @Override
    public List<ReportRecord> getAllReports() {
        return reportDao.getAllReports();
    }

    @Override
    public boolean handleReport(Integer reportId, Integer handledBy, String handleResult, Integer reportStatus) {
        if (reportId == null || handledBy == null || reportStatus == null) {
            return false;
        }

        if (handleResult == null || handleResult.trim().isEmpty()) {
            return false;
        }

        return reportDao.handleReport(reportId, handledBy, handleResult, reportStatus) > 0;
    }
}