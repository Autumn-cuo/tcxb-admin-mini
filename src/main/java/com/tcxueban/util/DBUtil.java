package com.tcxueban.util;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DBUtil {

    private static String driverClassName;
    private static String url;
    private static String username;
    private static String password;

    static {
        try {
            Properties properties = new Properties();
            InputStream inputStream = DBUtil.class.getClassLoader().getResourceAsStream("db.properties");

            if (inputStream == null) {
                throw new RuntimeException("找不到 db.properties 配置文件");
            }

            properties.load(inputStream);

            driverClassName = properties.getProperty("driverClassName");
            url = properties.getProperty("url");
            username = properties.getProperty("username");
            password = properties.getProperty("password");

            Class.forName(driverClassName);
        } catch (Exception e) {
            throw new RuntimeException("数据库初始化失败：" + e.getMessage(), e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }

    public static void close(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}