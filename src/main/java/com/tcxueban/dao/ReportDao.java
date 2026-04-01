package com.tcxueban.dao;

import com.tcxueban.entity.ReportRecord;

import java.util.List;

public interface ReportDao {

    int addReport(ReportRecord reportRecord);

    List<ReportRecord> getReportsByReporterUserId(Integer reporterUserId);

    List<ReportRecord> getAllReports();

    int handleReport(Integer reportId, Integer handledBy, String handleResult, Integer reportStatus);
}