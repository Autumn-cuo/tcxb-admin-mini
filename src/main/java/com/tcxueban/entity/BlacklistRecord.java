package com.tcxueban.entity;

import java.util.Date;

public class BlacklistRecord {

    private Integer blacklistId;
    private Integer userId;
    private Integer blockedUserId;
    private String reason;
    private Integer blacklistStatus;
    private Date createdAt;
    private Date removedAt;

    public Integer getBlacklistId() {
        return blacklistId;
    }

    public void setBlacklistId(Integer blacklistId) {
        this.blacklistId = blacklistId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getBlockedUserId() {
        return blockedUserId;
    }

    public void setBlockedUserId(Integer blockedUserId) {
        this.blockedUserId = blockedUserId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Integer getBlacklistStatus() {
        return blacklistStatus;
    }

    public void setBlacklistStatus(Integer blacklistStatus) {
        this.blacklistStatus = blacklistStatus;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getRemovedAt() {
        return removedAt;
    }

    public void setRemovedAt(Date removedAt) {
        this.removedAt = removedAt;
    }
}