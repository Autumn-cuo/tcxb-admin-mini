package com.tcxueban.controller;

import com.google.gson.Gson;
import com.tcxueban.entity.PartnerApplication;
import com.tcxueban.entity.PartnerRelation;
import com.tcxueban.service.PartnerService;
import com.tcxueban.service.impl.PartnerServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/partner")
public class PartnerServlet extends HttpServlet {

    private final PartnerService partnerService = new PartnerServiceImpl();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doPost(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");

        String action = req.getParameter("action");

        if ("recommend".equals(action)) {
            recommend(req, resp);
        } else if ("apply".equals(action)) {
            apply(req, resp);
        } else if ("myApplied".equals(action)) {
            getMyApplied(req, resp);
        } else if ("myReceived".equals(action)) {
            getMyReceived(req, resp);
        } else if ("handleApply".equals(action)) {
            handleApply(req, resp);
        } else if ("myPartners".equals(action)) {
            getMyPartners(req, resp);
        } else {
            Map<String, Object> result = new HashMap<>();
            result.put("code", 400);
            result.put("msg", "无效的请求动作");
            resp.getWriter().write(gson.toJson(result));
        }
    }

    private void recommend(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            List<Map<String, Object>> list = partnerService.recommend(userId);
            result.put("code", 200);
            result.put("msg", "推荐成功");
            result.put("data", list);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }
        resp.getWriter().write(gson.toJson(result));
    }

    private void apply(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer applicantUserId = Integer.parseInt(req.getParameter("applicantUserId"));
            Integer targetUserId = Integer.parseInt(req.getParameter("targetUserId"));
            String message = req.getParameter("message");

            boolean success = partnerService.apply(applicantUserId, targetUserId, message);
            if (success) {
                result.put("code", 200);
                result.put("msg", "申请已发送");
            } else {
                result.put("code", 500);
                result.put("msg", "申请失败，可能已发送过申请或已是学伴");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }
        resp.getWriter().write(gson.toJson(result));
    }

    private void getMyApplied(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            List<PartnerApplication> list = partnerService.getMyApplied(userId);
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

    private void getMyReceived(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            List<PartnerApplication> list = partnerService.getMyReceived(userId);
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

    private void handleApply(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer applyId = Integer.parseInt(req.getParameter("applyId"));
            Integer targetUserId = Integer.parseInt(req.getParameter("userId"));
            Integer applyStatus = Integer.parseInt(req.getParameter("applyStatus")); // 1=接受, 2=拒绝

            boolean success = partnerService.handleApply(applyId, targetUserId, applyStatus);
            if (success) {
                result.put("code", 200);
                result.put("msg", applyStatus == 1 ? "已接受申请" : "已拒绝申请");
            } else {
                result.put("code", 500);
                result.put("msg", "处理失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }
        resp.getWriter().write(gson.toJson(result));
    }

    private void getMyPartners(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            List<PartnerRelation> list = partnerService.getMyPartners(userId);
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
}
