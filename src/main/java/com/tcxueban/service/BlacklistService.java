package com.tcxueban.service;

import com.tcxueban.entity.BlacklistRecord;

import java.util.List;

public interface BlacklistService {

    boolean addBlacklist(BlacklistRecord blacklistRecord);

    List<BlacklistRecord> getMyBlacklist(Integer userId);

    boolean removeBlacklist(Integer userId, Integer blockedUserId);
}