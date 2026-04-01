package com.tcxueban.entity;

import java.util.Date;

public class PartnerRelation {

    private Integer relationId;
    private Integer userIdA;
    private Integer userIdB;
    private String course;
    private Integer progressCurrent;
    private Integer progressTotal;
    private Integer relationStatus; // 0=活跃, 1=已结束
    private Date createdAt;

    // 非数据库字段，用于前端展示
    private String partnerName;
    private Integer partnerTrustScore;
    private Integer partnerUserId;

    public Integer getRelationId() {
        return relationId;
    }

    public void setRelationId(Integer relationId) {
        this.relationId = relationId;
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

    public Integer getProgressCurrent() {
        return progressCurrent;
    }

    public void setProgressCurrent(Integer progressCurrent) {
        this.progressCurrent = progressCurrent;
    }

    public Integer getProgressTotal() {
        return progressTotal;
    }

    public void setProgressTotal(Integer progressTotal) {
        this.progressTotal = progressTotal;
    }

    public Integer getRelationStatus() {
        return relationStatus;
    }

    public void setRelationStatus(Integer relationStatus) {
        this.relationStatus = relationStatus;
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

    public Integer getPartnerTrustScore() {
        return partnerTrustScore;
    }

    public void setPartnerTrustScore(Integer partnerTrustScore) {
        this.partnerTrustScore = partnerTrustScore;
    }

    public Integer getPartnerUserId() {
        return partnerUserId;
    }

    public void setPartnerUserId(Integer partnerUserId) {
        this.partnerUserId = partnerUserId;
    }
}
