package com.tcxueban.service.impl;

import com.tcxueban.dao.StudyScheduleDao;
import com.tcxueban.dao.impl.StudyScheduleDaoImpl;
import com.tcxueban.entity.StudySchedule;
import com.tcxueban.service.ScheduleService;

import java.util.Collections;
import java.util.List;

public class ScheduleServiceImpl implements ScheduleService {

    private final StudyScheduleDao scheduleDao = new StudyScheduleDaoImpl();

    @Override
    public boolean addSchedule(Integer userId, Integer partnerUserId, String course,
                               String studyDate, String studyTime, String studyPlace) {
        if (userId == null || partnerUserId == null) return false;
        if (studyDate == null || studyDate.trim().isEmpty()) return false;
        if (studyTime == null || studyTime.trim().isEmpty()) return false;
        if (studyPlace == null || studyPlace.trim().isEmpty()) return false;

        StudySchedule schedule = new StudySchedule();
        schedule.setUserIdA(userId);
        schedule.setUserIdB(partnerUserId);
        schedule.setCourse(course != null ? course.trim() : "");
        schedule.setStudyDate(studyDate.trim());
        schedule.setStudyTime(studyTime.trim());
        schedule.setStudyPlace(studyPlace.trim());
        schedule.setScheduleStatus(0);

        return scheduleDao.addSchedule(schedule) > 0;
    }

    @Override
    public List<StudySchedule> getUpcoming(Integer userId) {
        if (userId == null) return Collections.emptyList();
        return scheduleDao.getUpcomingByUserId(userId);
    }

    @Override
    public List<StudySchedule> getHistory(Integer userId) {
        if (userId == null) return Collections.emptyList();
        return scheduleDao.getHistoryByUserId(userId);
    }
}
