package com.tcxueban.service.impl;

import com.tcxueban.dao.CheckinDao;
import com.tcxueban.dao.StudyScheduleDao;
import com.tcxueban.dao.UserDao;
import com.tcxueban.dao.impl.CheckinDaoImpl;
import com.tcxueban.dao.impl.StudyScheduleDaoImpl;
import com.tcxueban.dao.impl.UserDaoImpl;
import com.tcxueban.entity.CheckinRecord;
import com.tcxueban.service.CheckinService;

public class CheckinServiceImpl implements CheckinService {

    private final CheckinDao checkinDao = new CheckinDaoImpl();
    private final StudyScheduleDao scheduleDao = new StudyScheduleDaoImpl();
    private final UserDao userDao = new UserDaoImpl();

    @Override
    public boolean checkin(Integer userId, Integer scheduleId) {
        if (userId == null || scheduleId == null) return false;

        // 已签到
        if (checkinDao.hasCheckedIn(scheduleId, userId)) return false;

        CheckinRecord record = new CheckinRecord();
        record.setScheduleId(scheduleId);
        record.setUserId(userId);
        record.setScore(5.0);

        int rows = checkinDao.addCheckin(record);
        if (rows <= 0) return false;

        // 将对应学习安排标记为已完成
        scheduleDao.updateStatus(scheduleId, 1);

        // 信誉分 +1
        userDao.updateTrustScore(userId, 1);

        return true;
    }
}
