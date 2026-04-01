package com.tcxueban.service;

import com.tcxueban.entity.PartnerApplication;
import com.tcxueban.entity.PartnerRelation;
import com.tcxueban.entity.User;

import java.util.List;
import java.util.Map;

public interface PartnerService {

    /**
     * 发送学伴申请
     */
    boolean apply(Integer applicantUserId, Integer targetUserId, String message);

    /**
     * 查询我发送的申请
     */
    List<PartnerApplication> getMyApplied(Integer userId);

    /**
     * 查询我收到的待处理申请
     */
    List<PartnerApplication> getMyReceived(Integer userId);

    /**
     * 处理申请（接受=1 / 拒绝=2）
     */
    boolean handleApply(Integer applyId, Integer targetUserId, Integer applyStatus);

    /**
     * 查询我的当前学伴列表
     */
    List<PartnerRelation> getMyPartners(Integer userId);

    /**
     * 匹配推荐：返回 Map 列表，每个 Map 包含 user 信息 + matchScore + matchReasons
     */
    List<Map<String, Object>> recommend(Integer userId);
}
