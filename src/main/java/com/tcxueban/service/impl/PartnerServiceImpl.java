package com.tcxueban.service.impl;

import com.tcxueban.dao.PartnerApplicationDao;
import com.tcxueban.dao.PartnerRelationDao;
import com.tcxueban.dao.UserDao;
import com.tcxueban.dao.impl.PartnerApplicationDaoImpl;
import com.tcxueban.dao.impl.PartnerRelationDaoImpl;
import com.tcxueban.dao.impl.UserDaoImpl;
import com.tcxueban.entity.PartnerApplication;
import com.tcxueban.entity.PartnerRelation;
import com.tcxueban.entity.User;
import com.tcxueban.service.PartnerService;

import java.util.*;

public class PartnerServiceImpl implements PartnerService {

    private final UserDao userDao = new UserDaoImpl();
    private final PartnerApplicationDao applicationDao = new PartnerApplicationDaoImpl();
    private final PartnerRelationDao relationDao = new PartnerRelationDaoImpl();

    @Override
    public boolean apply(Integer applicantUserId, Integer targetUserId, String message) {
        if (applicantUserId == null || targetUserId == null) return false;
        if (applicantUserId.equals(targetUserId)) return false;

        // 已经是学伴
        if (relationDao.exists(applicantUserId, targetUserId)) return false;
        // 已有待处理的申请
        if (applicationDao.exists(applicantUserId, targetUserId)) return false;

        PartnerApplication app = new PartnerApplication();
        app.setApplicantUserId(applicantUserId);
        app.setTargetUserId(targetUserId);
        app.setMessage(message != null ? message : "");
        app.setApplyStatus(0);

        return applicationDao.addApplication(app) > 0;
    }

    @Override
    public List<PartnerApplication> getMyApplied(Integer userId) {
        if (userId == null) return Collections.emptyList();
        return applicationDao.getApplied(userId);
    }

    @Override
    public List<PartnerApplication> getMyReceived(Integer userId) {
        if (userId == null) return Collections.emptyList();
        return applicationDao.getReceived(userId);
    }

    @Override
    public boolean handleApply(Integer applyId, Integer targetUserId, Integer applyStatus) {
        if (applyId == null || targetUserId == null || applyStatus == null) return false;
        if (applyStatus != 1 && applyStatus != 2) return false;

        int rows = applicationDao.handleApplication(applyId, applyStatus);
        if (rows <= 0) return false;

        // 接受申请时，创建搭子关系
        if (applyStatus == 1) {
            PartnerApplication target = findApplicationById(applyId);
            if (target != null && !relationDao.exists(target.getApplicantUserId(), targetUserId)) {
                PartnerRelation relation = new PartnerRelation();
                relation.setUserIdA(target.getApplicantUserId());
                relation.setUserIdB(targetUserId);

                // 使用申请人的第一门偏好课程作为合作课程
                User applicant = userDao.findById(target.getApplicantUserId());
                String course = "";
                if (applicant != null && applicant.getPreferredCourses() != null
                        && !applicant.getPreferredCourses().isEmpty()) {
                    String[] courses = applicant.getPreferredCourses().split(",");
                    course = courses[0].trim();
                }
                relation.setCourse(course);
                relationDao.addRelation(relation);
            }
        }

        return true;
    }

    @Override
    public List<PartnerRelation> getMyPartners(Integer userId) {
        if (userId == null) return Collections.emptyList();
        return relationDao.getMyRelations(userId);
    }

    @Override
    public List<Map<String, Object>> recommend(Integer userId) {
        if (userId == null) return Collections.emptyList();

        User currentUser = userDao.findById(userId);
        if (currentUser == null) return Collections.emptyList();

        List<User> candidates = userDao.getAllExcept(userId);
        List<PartnerRelation> currentPartners = relationDao.getMyRelations(userId);

        // 已是学伴的 userId 集合
        Set<Integer> partnerIds = new HashSet<>();
        for (PartnerRelation r : currentPartners) {
            partnerIds.add(r.getPartnerUserId());
        }

        Set<String> myCourses = splitToSet(currentUser.getPreferredCourses());
        Set<String> myTimes = splitToSet(currentUser.getPreferredTimes());
        Set<String> myPlaces = splitToSet(currentUser.getPreferredPlaces());

        List<Map<String, Object>> result = new ArrayList<>();

        for (User candidate : candidates) {
            if (partnerIds.contains(candidate.getUserId())) continue;

            Set<String> theirCourses = splitToSet(candidate.getPreferredCourses());
            Set<String> theirTimes = splitToSet(candidate.getPreferredTimes());
            Set<String> theirPlaces = splitToSet(candidate.getPreferredPlaces());

            List<Map<String, Object>> reasons = new ArrayList<>();
            int matchScore = 50; // 基础分

            // 课程匹配（最高 +30）
            Set<String> sharedCourses = intersection(myCourses, theirCourses);
            if (!sharedCourses.isEmpty()) {
                int bonus = Math.min(30, sharedCourses.size() * 10);
                matchScore += bonus;
                reasons.add(buildReason(
                        "你们都在学习 " + String.join("、", sharedCourses),
                        bonus, "#3f6fb5"));
            } else if (!myCourses.isEmpty() && !theirCourses.isEmpty()) {
                // 不同课程但都有课程设置，给少量加分（学习意向相近）
                matchScore += 5;
            }

            // 时间匹配（最高 +25）
            Set<String> sharedTimes = intersection(myTimes, theirTimes);
            if (!sharedTimes.isEmpty()) {
                int bonus = Math.min(25, sharedTimes.size() * 8);
                matchScore += bonus;
                reasons.add(buildReason(
                        "学习时间高度重合：" + String.join("、", sharedTimes),
                        bonus, "#16a34a"));
            }

            // 地点匹配（最高 +20）
            Set<String> sharedPlaces = intersection(myPlaces, theirPlaces);
            if (!sharedPlaces.isEmpty()) {
                int bonus = Math.min(20, sharedPlaces.size() * 7);
                matchScore += bonus;
                reasons.add(buildReason(
                        "都偏好在 " + String.join("、", sharedPlaces) + " 学习",
                        bonus, "#9333ea"));
            }

            // 同专业加分（+10）
            if (currentUser.getMajor() != null && currentUser.getMajor().equals(candidate.getMajor())) {
                matchScore += 10;
                reasons.add(buildReason("同专业，学习背景相近", 10, "#db2777"));
            }

            // 信誉分相近（+5）
            int trustDiff = Math.abs((currentUser.getTrustScore() != null ? currentUser.getTrustScore() : 100)
                    - (candidate.getTrustScore() != null ? candidate.getTrustScore() : 100));
            if (trustDiff <= 15) {
                matchScore += 5;
                reasons.add(buildReason("信誉分相近，学习态度认真", 5, "#ea580c"));
            }

            matchScore = Math.min(99, matchScore);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("userId", candidate.getUserId());
            item.put("realName", candidate.getRealName());
            item.put("nickname", candidate.getNickname() != null ? candidate.getNickname() : candidate.getRealName());
            item.put("major", candidate.getMajor());
            item.put("grade", candidate.getGrade());
            item.put("studentNo", candidate.getStudentNo());
            item.put("trustScore", candidate.getTrustScore());
            item.put("preferredCourses", candidate.getPreferredCourses());
            item.put("preferredTimes", candidate.getPreferredTimes());
            item.put("preferredPlaces", candidate.getPreferredPlaces());
            item.put("matchScore", matchScore);
            item.put("matchReasons", reasons);
            result.add(item);
        }

        // 按匹配度降序排序
        result.sort((a, b) -> (Integer) b.get("matchScore") - (Integer) a.get("matchScore"));
        return result;
    }

    // ---- 私有辅助方法 ----

    private Set<String> splitToSet(String value) {
        Set<String> set = new LinkedHashSet<>();
        if (value == null || value.trim().isEmpty()) return set;
        for (String s : value.split(",")) {
            String trimmed = s.trim();
            if (!trimmed.isEmpty()) set.add(trimmed);
        }
        return set;
    }

    private Set<String> intersection(Set<String> a, Set<String> b) {
        Set<String> result = new LinkedHashSet<>(a);
        result.retainAll(b);
        return result;
    }

    private Map<String, Object> buildReason(String text, int percent, String color) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("text", text);
        r.put("percent", percent);
        r.put("color", color);
        return r;
    }

    /**
     * 通过 applyId 查询申请记录（用于接受申请后获取 applicantUserId）
     */
    private PartnerApplication findApplicationById(Integer applyId) {
        String sql = "SELECT apply_id, applicant_user_id, target_user_id, message, apply_status " +
                "FROM partner_application WHERE apply_id = ?";
        try (java.sql.Connection conn = com.tcxueban.util.DBUtil.getConnection();
             java.sql.PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, applyId);
            try (java.sql.ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    PartnerApplication app = new PartnerApplication();
                    app.setApplyId(rs.getInt("apply_id"));
                    app.setApplicantUserId(rs.getInt("applicant_user_id"));
                    app.setTargetUserId(rs.getInt("target_user_id"));
                    app.setMessage(rs.getString("message"));
                    app.setApplyStatus(rs.getInt("apply_status"));
                    return app;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
