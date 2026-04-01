package com.tcxueban.controller;

import com.tcxueban.util.DBUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;

@WebServlet("/dbTest")
public class DbTestServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");

        try (Connection conn = DBUtil.getConnection()) {
            if (conn != null && !conn.isClosed()) {
                resp.getWriter().write("数据库连接成功！");
            } else {
                resp.getWriter().write("数据库连接失败：连接对象为空或已关闭");
            }
        } catch (Exception e) {
            resp.getWriter().write("数据库连接失败：" + e.getMessage());
            e.printStackTrace();
        }
    }
}