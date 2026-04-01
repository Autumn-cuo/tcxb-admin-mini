package com.tcxueban.service;

public interface CheckinService {

    /**
     * 签到打卡，成功后更新信誉分 +1
     */
    boolean checkin(Integer userId, Integer scheduleId);
}
