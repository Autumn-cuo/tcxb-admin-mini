package com.tcxueban.controller;

import com.google.gson.Gson;
import com.tcxueban.entity.Admin;
import com.tcxueban.service.AdminService;
import com.tcxueban.service.impl.AdminServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/admin")
public class AdminServlet extends HttpServlet {

    private final AdminService adminService = new AdminServiceImpl();
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

        if ("login".equals(action)) {
            login(req, resp);
        } else if ("userList".equals(action)) {
            getUserList(req, resp);
        } else if ("updateUserStatus".equals(action)) {
            updateUserStatus(req, resp);
        } else {
            Map<String, Object> result = new HashMap<>();
            result.put("code", 400);
            result.put("msg", "无效的请求动作");
            resp.getWriter().write(gson.toJson(result));
        }
    }

    private void login(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();

        try {
            String adminAccount = req.getParameter("adminAccount");
            String password = req.getParameter("password");

            Admin admin = adminService.login(adminAccount, password);

            if (admin != null) {
                result.put("code", 200);
                result.put("msg", "登录成功");
                result.put("data", admin);
            } else {
                result.put("code", 500);
                result.put("msg", "账号或密码错误，或管理员状态异常");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }

        resp.getWriter().write(gson.toJson(result));
    }

    private void getUserList(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();

        try {
            result.put("code", 200);
            result.put("msg", "查询成功");
            result.put("data", adminService.getAllUsers());
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }

        resp.getWriter().write(gson.toJson(result));
    }

    private void updateUserStatus(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();

        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            Integer accountStatus = Integer.parseInt(req.getParameter("accountStatus"));

            boolean success = adminService.updateUserStatus(userId, accountStatus);

            if (success) {
                result.put("code", 200);
                result.put("msg", "更新用户状态成功");
            } else {
                result.put("code", 500);
                result.put("msg", "更新用户状态失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }

        resp.getWriter().write(gson.toJson(result));
    }
}