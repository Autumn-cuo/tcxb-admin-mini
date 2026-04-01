package com.tcxueban.service.impl;

import com.tcxueban.dao.BlacklistDao;
import com.tcxueban.dao.impl.BlacklistDaoImpl;
import com.tcxueban.entity.BlacklistRecord;
import com.tcxueban.service.BlacklistService;

import java.util.Collections;
import java.util.List;

public class BlacklistServiceImpl implements BlacklistService {

    private final BlacklistDao blacklistDao = new BlacklistDaoImpl();

    @Override
    public boolean addBlacklist(BlacklistRecord blacklistRecord) {
        if (blacklistRecord == null) {
            return false;
        }

        if (blacklistRecord.getUserId() == null || blacklistRecord.getBlockedUserId() == null) {
            return false;
        }

        if (blacklistRecord.getUserId().equals(blacklistRecord.getBlockedUserId())) {
            return false;
        }

        if (blacklistRecord.getBlacklistStatus() == null) {
            blacklistRecord.setBlacklistStatus(0);
        }

        return blacklistDao.addBlacklist(blacklistRecord) > 0;
    }

    @Override
    public List<BlacklistRecord> getMyBlacklist(Integer userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return blacklistDao.getBlacklistByUserId(userId);
    }

    @Override
    public boolean removeBlacklist(Integer userId, Integer blockedUserId) {
        if (userId == null || blockedUserId == null) {
            return false;
        }

        if (userId.equals(blockedUserId)) {
            return false;
        }

        return blacklistDao.removeBlacklist(userId, blockedUserId) > 0;
    }
}