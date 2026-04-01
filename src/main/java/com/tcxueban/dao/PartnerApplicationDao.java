package com.tcxueban.dao;

import com.tcxueban.entity.PartnerApplication;

import java.util.List;

public interface PartnerApplicationDao {

    int addApplication(PartnerApplication application);

    List<PartnerApplication> getApplied(Integer applicantUserId);

    List<PartnerApplication> getReceived(Integer targetUserId);

    int handleApplication(Integer applyId, Integer applyStatus);

    boolean exists(Integer applicantUserId, Integer targetUserId);
}
