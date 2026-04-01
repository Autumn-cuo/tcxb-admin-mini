package com.tcxueban.controller;

import com.google.gson.Gson;
import com.tcxueban.entity.User;
import com.tcxueban.service.UserService;
import com.tcxueban.service.impl.UserServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/user")
public class UserServlet extends HttpServlet {

    private final UserService userService = new UserServiceImpl();
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

        if ("register".equals(action)) {
            register(req, resp);
        } else if ("login".equals(action)) {
            login(req, resp);
        } else if ("getInfo".equals(action)) {
            getInfo(req, resp);
        } else if ("updateProfile".equals(action)) {
            updateProfile(req, resp);
        } else {
            Map<String, Object> result = new HashMap<>();
            result.put("code", 400);
            result.put("msg", "无效的请求动作");
            resp.getWriter().write(gson.toJson(result));
        }
    }

    private void register(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            String studentNo = req.getParameter("studentNo");
            String realName = req.getParameter("realName");
            String major = req.getParameter("major");
            String grade = req.getParameter("grade");
            String schoolEmail = req.getParameter("schoolEmail");
            String password = req.getParameter("password");

            User user = userService.register(studentNo, realName, major, grade, schoolEmail, password);
            if (user != null) {
                result.put("code", 200);
                result.put("msg", "注册成功");
                result.put("data", sanitizeUser(user));
            } else {
                result.put("code", 500);
                result.put("msg", "注册失败，该邮箱或学号已被注册");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }
        resp.getWriter().write(gson.toJson(result));
    }

    private void login(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            String schoolEmail = req.getParameter("schoolEmail");
            String password = req.getParameter("password");

            User user = userService.login(schoolEmail, password);
            if (user != null) {
                result.put("code", 200);
                result.put("msg", "登录成功");
                result.put("data", sanitizeUser(user));
            } else {
                result.put("code", 500);
                result.put("msg", "邮箱或密码错误，或账号已被封禁");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }
        resp.getWriter().write(gson.toJson(result));
    }

    private void getInfo(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            User user = userService.getInfo(userId);
            if (user != null) {
                result.put("code", 200);
                result.put("msg", "查询成功");
                result.put("data", sanitizeUser(user));
            } else {
                result.put("code", 500);
                result.put("msg", "用户不存在");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }
        resp.getWriter().write(gson.toJson(result));
    }

    private void updateProfile(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer userId = Integer.parseInt(req.getParameter("userId"));
            String realName = req.getParameter("realName");
            String major = req.getParameter("major");
            String grade = req.getParameter("grade");
            String preferredCourses = req.getParameter("preferredCourses");
            String preferredTimes = req.getParameter("preferredTimes");
            String preferredPlaces = req.getParameter("preferredPlaces");

            boolean success = userService.updateProfile(userId, realName, major, grade,
                    preferredCourses, preferredTimes, preferredPlaces);
            if (success) {
                result.put("code", 200);
                result.put("msg", "更新成功");
                result.put("data", sanitizeUser(userService.getInfo(userId)));
            } else {
                result.put("code", 500);
                result.put("msg", "更新失败，请检查参数");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "系统异常：" + e.getMessage());
        }
        resp.getWriter().write(gson.toJson(result));
    }

    /**
     * 去除密码字段后返回用户信息
     */
    private Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("userId", user.getUserId());
        map.put("studentNo", user.getStudentNo());
        map.put("realName", user.getRealName());
        map.put("nickname", user.getNickname() != null ? user.getNickname() : user.getRealName());
        map.put("schoolEmail", user.getSchoolEmail());
        map.put("gender", user.getGender());
        map.put("major", user.getMajor());
        map.put("grade", user.getGrade());
        map.put("accountStatus", user.getAccountStatus());
        map.put("trustScore", user.getTrustScore());
        map.put("preferredCourses", user.getPreferredCourses() != null ? user.getPreferredCourses() : "");
        map.put("preferredTimes", user.getPreferredTimes() != null ? user.getPreferredTimes() : "");
        map.put("preferredPlaces", user.getPreferredPlaces() != null ? user.getPreferredPlaces() : "");
        return map;
    }
}
