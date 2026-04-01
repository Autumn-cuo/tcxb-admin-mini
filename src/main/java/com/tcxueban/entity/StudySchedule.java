package com.tcxueban.entity;

import java.util.Date;

public class StudySchedule {

    private Integer scheduleId;
    private Integer userIdA;
    private Integer userIdB;
    private String course;
    private String studyDate; // 格式: yyyy-MM-dd
    private String studyTime; // 格式: 14:00-16:00
    private String studyPlace;
    private Integer scheduleStatus; // 0=待签到, 1=已完成, 2=已过期
    private Date createdAt;

    // 非数据库字段，用于前端展示
    private String partnerName;
    private Integer partnerUserId;
    private Double score; // 签到后的评分，来自 checkin_record

    public Integer getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Integer scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Integer getUserIdA() {
        return userIdA;
    }

    public void setUserIdA(Integer userIdA) {
        this.userIdA = userIdA;
    }

    public Integer getUserIdB() {
        return userIdB;
    }

    public void setUserIdB(Integer userIdB) {
        this.userIdB = userIdB;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getStudyDate() {
        return studyDate;
    }

    public void setStudyDate(String studyDate) {
        this.studyDate = studyDate;
    }

    public String getStudyTime() {
        return studyTime;
    }

    public void setStudyTime(String studyTime) {
        this.studyTime = studyTime;
    }

    public String getStudyPlace() {
        return studyPlace;
    }

    public void setStudyPlace(String studyPlace) {
        this.studyPlace = studyPlace;
    }

    public Integer getScheduleStatus() {
        return scheduleStatus;
    }

    public void setScheduleStatus(Integer scheduleStatus) {
        this.scheduleStatus = scheduleStatus;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public Integer getPartnerUserId() {
        return partnerUserId;
    }

    public void setPartnerUserId(Integer partnerUserId) {
        this.partnerUserId = partnerUserId;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }
}
