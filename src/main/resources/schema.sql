-- ============================================================
-- 同窗学伴 (tongchuangxueban) 数据库初始化脚本
-- 请在 MySQL 中手动执行此文件
-- ============================================================

CREATE DATABASE IF NOT EXISTS tongchuangxueban DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tongchuangxueban;

-- ------------------------------------------------------------
-- 管理员表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin (
    admin_id       INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    admin_account  VARCHAR(50)  NOT NULL UNIQUE COMMENT '管理员账号',
    admin_name     VARCHAR(50)  COMMENT '管理员姓名',
    password_hash  VARCHAR(200) NOT NULL COMMENT '密码（明文，后期可改 hash）',
    admin_status   INT          NOT NULL DEFAULT 0 COMMENT '状态：0=正常',
    last_login_time DATETIME    COMMENT '最后登录时间',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 默认管理员账号：admin / admin123
INSERT IGNORE INTO admin (admin_account, admin_name, password_hash, admin_status)
VALUES ('admin', '系统管理员', 'admin123', 0);

-- ------------------------------------------------------------
-- 用户表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
    user_id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    student_no        VARCHAR(30)  NOT NULL UNIQUE COMMENT '学号',
    real_name         VARCHAR(50)  NOT NULL COMMENT '真实姓名',
    nickname          VARCHAR(50)  COMMENT '昵称',
    school_email      VARCHAR(100) NOT NULL UNIQUE COMMENT '学校邮箱',
    password_hash     VARCHAR(200) NOT NULL COMMENT '密码（明文，后期可改 hash）',
    gender            VARCHAR(10)  COMMENT '性别',
    major             VARCHAR(100) COMMENT '专业',
    grade             VARCHAR(20)  COMMENT '年级，如：大二',
    account_status    INT          NOT NULL DEFAULT 0 COMMENT '账号状态：0=正常,1=限制,2=封禁',
    role_type         INT          NOT NULL DEFAULT 0 COMMENT '角色：0=学生',
    trust_score       INT          NOT NULL DEFAULT 100 COMMENT '信誉分（0-100）',
    preferred_courses VARCHAR(500) NOT NULL DEFAULT '' COMMENT '偏好课程，逗号分隔',
    preferred_times   VARCHAR(200) NOT NULL DEFAULT '' COMMENT '偏好时间，逗号分隔',
    preferred_places  VARCHAR(200) NOT NULL DEFAULT '' COMMENT '偏好地点，逗号分隔',
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 黑名单表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blacklist_record (
    blacklist_id     INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL COMMENT '拉黑方',
    blocked_user_id  INT NOT NULL COMMENT '被拉黑方',
    reason           VARCHAR(500),
    blacklist_status INT NOT NULL DEFAULT 0 COMMENT '状态：0=生效,1=已移除',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    removed_at       DATETIME,
    FOREIGN KEY (user_id)         REFERENCES user(user_id),
    FOREIGN KEY (blocked_user_id) REFERENCES user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 举报记录表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS report_record (
    report_id        INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    reporter_user_id INT          NOT NULL COMMENT '举报人',
    reported_user_id INT          NOT NULL COMMENT '被举报人',
    report_reason    VARCHAR(100) NOT NULL,
    report_detail    TEXT,
    evidence_url     VARCHAR(500),
    evidence_name    VARCHAR(200),
    report_status    INT          NOT NULL DEFAULT 0 COMMENT '状态：0=待处理,1=已处理',
    handled_by       INT          COMMENT '处理管理员ID',
    handle_result    TEXT,
    report_time      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    handle_time      DATETIME,
    FOREIGN KEY (reporter_user_id) REFERENCES user(user_id),
    FOREIGN KEY (reported_user_id) REFERENCES user(user_id),
    FOREIGN KEY (handled_by)       REFERENCES admin(admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 搭子申请表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_application (
    apply_id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    applicant_user_id  INT          NOT NULL COMMENT '申请人',
    target_user_id     INT          NOT NULL COMMENT '被申请人',
    message            VARCHAR(500) COMMENT '申请留言',
    apply_status       INT          NOT NULL DEFAULT 0 COMMENT '状态：0=待处理,1=已接受,2=已拒绝',
    apply_time         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    handle_time        DATETIME,
    FOREIGN KEY (applicant_user_id) REFERENCES user(user_id),
    FOREIGN KEY (target_user_id)    REFERENCES user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 搭子关系表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_relation (
    relation_id      INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id_a        INT          NOT NULL COMMENT '学伴A',
    user_id_b        INT          NOT NULL COMMENT '学伴B',
    course           VARCHAR(200) COMMENT '合作课程',
    progress_current INT          NOT NULL DEFAULT 0 COMMENT '已完成次数',
    progress_total   INT          NOT NULL DEFAULT 12 COMMENT '计划总次数',
    relation_status  INT          NOT NULL DEFAULT 0 COMMENT '状态：0=活跃,1=已结束',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id_a) REFERENCES user(user_id),
    FOREIGN KEY (user_id_b) REFERENCES user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 学习约定（安排）表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_schedule (
    schedule_id     INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id_a       INT          NOT NULL COMMENT '发起人',
    user_id_b       INT          NOT NULL COMMENT '对方',
    course          VARCHAR(200) COMMENT '课程',
    study_date      DATE         NOT NULL COMMENT '学习日期',
    study_time      VARCHAR(100) COMMENT '时间段，如：19:00-21:00',
    study_place     VARCHAR(200) COMMENT '地点',
    schedule_status INT          NOT NULL DEFAULT 0 COMMENT '状态：0=待签到,1=已完成,2=已过期',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id_a) REFERENCES user(user_id),
    FOREIGN KEY (user_id_b) REFERENCES user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 签到记录表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkin_record (
    checkin_id   INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
    schedule_id  INT            NOT NULL COMMENT '对应的学习安排',
    user_id      INT            NOT NULL COMMENT '签到人',
    checkin_time DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score        DECIMAL(3, 1)  NOT NULL DEFAULT 5.0 COMMENT '本次评分',
    FOREIGN KEY (schedule_id) REFERENCES study_schedule(schedule_id),
    FOREIGN KEY (user_id)     REFERENCES user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
