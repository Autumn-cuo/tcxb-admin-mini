package com.tcxueban.dao;

import com.tcxueban.entity.BlacklistRecord;

import java.util.List;

public interface BlacklistDao {

    int addBlacklist(BlacklistRecord blacklistRecord);

    List<BlacklistRecord> getBlacklistByUserId(Integer userId);

    int removeBlacklist(Integer userId, Integer blockedUserId);
}