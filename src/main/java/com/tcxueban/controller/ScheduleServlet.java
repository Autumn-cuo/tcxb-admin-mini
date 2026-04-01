package com.tcxueban.controller;

import com.google.gson.Gson;
import com.tcxueban.entity.StudySchedule;
import com.tcxueban.service.ScheduleService;
import com.tcxueban.service.impl.ScheduleServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/schedule")
public class ScheduleServlet extends HttpServlet {

    private final ScheduleService scheduleService = new ScheduleServiceImpl();
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

        if ("add".equals(action)) {
            addSchedule(req, resp);
        } else if ("myUpcoming".equals(action)) {
            getUpcoming(req, resp);
        } else if ("myHistory".equals(action)) {
            getHistory(req, resp);
        } else {
            Map<String, Object> result = new HashMap<>();
            result.put("code", 400);
            result.put("msg", "无效的请求动作");
            resp.getWriter().write(gson.toJson(result));
        }
    }

    private void addSchedule(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            Integer partnerUserId = Integer.parseInt(req.getParameter("partnerUserId"));
            String course = req.getParameter("course");
            String studyDate = req.getParameter("studyDate");
            String studyTime = req.getParameter("studyTime");
            String studyPlace = req.getParameter("studyPlace");

            boolean success = scheduleService.addSchedule(userId, partnerUserId, course,
                    studyDate, studyTime, studyPlace);
            if (success) {
                result.put("code", 200);
                result.put("msg", "学习安排创建成功");
            } else {
                result.put("code", 500);
                result.put("msg", "创建失败，请检查参数");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }
        resp.getWriter().write(gson.toJson(result));
    }

    private void getUpcoming(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            List<StudySchedule> list = scheduleService.getUpcoming(userId);
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

    private void getHistory(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            List<StudySchedule> list = scheduleService.getHistory(userId);
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
