package com.tcxueban.dao;

import com.tcxueban.entity.PartnerRelation;

import java.util.List;

public interface PartnerRelationDao {

    int addRelation(PartnerRelation relation);

    List<PartnerRelation> getMyRelations(Integer userId);

    int updateProgress(Integer relationId, Integer progressCurrent);

    int endRelation(Integer relationId);

    boolean exists(Integer userIdA, Integer userIdB);
}
