package com.tcxueban.controller;

import com.google.gson.Gson;
import com.tcxueban.entity.BlacklistRecord;
import com.tcxueban.service.BlacklistService;
import com.tcxueban.service.impl.BlacklistServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/blacklist")
public class BlacklistServlet extends HttpServlet {

    private final BlacklistService blacklistService = new BlacklistServiceImpl();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");

        String action = req.getParameter("action");

        if ("list".equals(action)) {
            getMyBlacklist(req, resp);
        } else if ("add".equals(action)) {
            addBlacklist(req, resp);
        } else if ("remove".equals(action)) {
            removeBlacklist(req, resp);
        } else {
            Map<String, Object> result = new HashMap<>();
            result.put("code", 400);
            result.put("msg", "无效的请求动作");
            resp.getWriter().write(gson.toJson(result));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req, resp);
    }

    private void addBlacklist(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();

        try {
            String userIdStr = req.getParameter("userId");
            String blockedUserIdStr = req.getParameter("blockedUserId");
            String reason = req.getParameter("reason");

            BlacklistRecord record = new BlacklistRecord();
            record.setUserId(Integer.parseInt(userIdStr));
            record.setBlockedUserId(Integer.parseInt(blockedUserIdStr));
            record.setReason(reason);
            record.setBlacklistStatus(0);

            boolean success = blacklistService.addBlacklist(record);

            if (success) {
                result.put("code", 200);
                result.put("msg", "加入黑名单成功");
            } else {
                result.put("code", 500);
                result.put("msg", "加入黑名单失败，请检查参数");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }

        resp.getWriter().write(gson.toJson(result));
    }

    private void getMyBlacklist(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();

        try {
            String userIdStr = req.getParameter("userId");
            Integer userId = Integer.parseInt(userIdStr);

            List<BlacklistRecord> list = blacklistService.getMyBlacklist(userId);

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

    private void removeBlacklist(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();

        try {
            String userIdStr = req.getParameter("userId");
            String blockedUserIdStr = req.getParameter("blockedUserId");

            Integer userId = Integer.parseInt(userIdStr);
            Integer blockedUserId = Integer.parseInt(blockedUserIdStr);

            boolean success = blacklistService.removeBlacklist(userId, blockedUserId);

            if (success) {
                result.put("code", 200);
                result.put("msg", "移除黑名单成功");
            } else {
                result.put("code", 500);
                result.put("msg", "移除黑名单失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }

        resp.getWriter().write(gson.toJson(result));
    }
}