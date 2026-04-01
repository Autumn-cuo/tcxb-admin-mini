package com.tcxueban.service;

import com.tcxueban.entity.ReportRecord;

import java.util.List;

public interface ReportService {

    boolean submitReport(ReportRecord reportRecord);

    List<ReportRecord> getMyReports(Integer reporterUserId);

    List<ReportRecord> getAllReports();

    boolean handleReport(Integer reportId, Integer handledBy, String handleResult, Integer reportStatus);
}