package com.tcxueban.controller;

import com.google.gson.Gson;
import com.tcxueban.service.CheckinService;
import com.tcxueban.service.impl.CheckinServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/checkin")
public class CheckinServlet extends HttpServlet {

    private final CheckinService checkinService = new CheckinServiceImpl();
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

        if ("checkin".equals(action)) {
            checkin(req, resp);
        } else {
            Map<String, Object> result = new HashMap<>();
            result.put("code", 400);
            result.put("msg", "无效的请求动作");
            resp.getWriter().write(gson.toJson(result));
        }
    }

    private void checkin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            Integer scheduleId = Integer.parseInt(req.getParameter("scheduleId"));

            boolean success = checkinService.checkin(userId, scheduleId);
            if (success) {
                result.put("code", 200);
                result.put("msg", "签到成功，信誉分 +1");
            } else {
                result.put("code", 500);
                result.put("msg", "签到失败，可能已签到或参数错误");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }
        resp.getWriter().write(gson.toJson(result));
    }
}
