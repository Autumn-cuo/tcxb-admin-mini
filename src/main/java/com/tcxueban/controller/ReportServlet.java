package com.tcxueban.controller;

import com.google.gson.Gson;
import com.tcxueban.entity.ReportRecord;
import com.tcxueban.service.ReportService;
import com.tcxueban.service.impl.ReportServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/report")
public class ReportServlet extends HttpServlet {

    private final ReportService reportService = new ReportServiceImpl();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");

        String action = req.getParameter("action");

        if ("myList".equals(action)) {
            getMyReports(req, resp);
        } else if ("submit".equals(action)) {
            submitReport(req, resp);
        } else if ("adminList".equals(action)) {
            getAllReports(req, resp);
        } else if ("handle".equals(action)) {
            handleReport(req, resp);
        } else {
            Map<String, Object> result = new HashMap<>();
            result.put("code", 400);
            result.put("msg", "无效的请求动作");
            resp.getWriter().write(gson.toJson(result));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");

        String action = req.getParameter("action");

        if ("submit".equals(action)) {
            submitReport(req, resp);
        } else if ("handle".equals(action)) {
            handleReport(req, resp);
        } else {
            Map<String, Object> result = new HashMap<>();
            result.put("code", 400);
            result.put("msg", "无效的请求动作");
            resp.getWriter().write(gson.toJson(result));
        }
    }

    private void submitReport(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();

        try {
            String reporterUserIdStr = req.getParameter("reporterUserId");
            String reportedUserIdStr = req.getParameter("reportedUserId");
            String reportReason = req.getParameter("reportReason");
            String reportDetail = req.getParameter("reportDetail");
            String evidenceUrl = req.getParameter("evidenceUrl");
            String evidenceName = req.getParameter("evidenceName");

            ReportRecord record = new ReportRecord();
            record.setReporterUserId(Integer.parseInt(reporterUserIdStr));
            record.setReportedUserId(Integer.parseInt(reportedUserIdStr));
            record.setReportReason(reportReason);
            record.setReportDetail(reportDetail);
            record.setEvidenceUrl(evidenceUrl);
            record.setEvidenceName(evidenceName);
            record.setReportStatus(0);

            boolean success = reportService.submitReport(record);

            if (success) {
                result.put("code", 200);
                result.put("msg", "举报提交成功");
            } else {
                result.put("code", 500);
                result.put("msg", "举报提交失败，请检查参数");
            }

        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }

        resp.getWriter().write(gson.toJson(result));
    }

    private void getMyReports(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();

        try {
            String reporterUserIdStr = req.getParameter("reporterUserId");
            Integer reporterUserId = Integer.parseInt(reporterUserIdStr);

            List<ReportRecord> list = reportService.getMyReports(reporterUserId);

            result.put("code", 200);
            result.put("msg", "查询成功");
            result.put("data", list);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }

        resp.getWriter().write(gson.toJson(result));
    }

    private void getAllReports(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();

        try {
            List<ReportRecord> list = reportService.getAllReports();
            result.put("code", 200);
            result.put("msg", "查询成功");
            result.put("data", list);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }

        resp.getWriter().write(gson.toJson(result));
    }

    private void handleReport(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();

        try {
            String reportIdStr = req.getParameter("reportId");
            String handledByStr = req.getParameter("handledBy");
            String handleResult = req.getParameter("handleResult");
            String reportStatusStr = req.getParameter("reportStatus");

            Integer reportId = Integer.parseInt(reportIdStr);
            Integer handledBy = Integer.parseInt(handledByStr);
            Integer reportStatus = Integer.parseInt(reportStatusStr);

            boolean success = reportService.handleReport(reportId, handledBy, handleResult, reportStatus);

            if (success) {
                result.put("code", 200);
                result.put("msg", "处理举报成功");
            } else {
                result.put("code", 500);
                result.put("msg", "处理举报失败，请检查参数");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }

        resp.getWriter().write(gson.toJson(result));
    }
}