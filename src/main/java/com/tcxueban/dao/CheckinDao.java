package com.tcxueban.dao;

import com.tcxueban.entity.CheckinRecord;

public interface CheckinDao {

    int addCheckin(CheckinRecord record);

    boolean hasCheckedIn(Integer scheduleId, Integer userId);
}
