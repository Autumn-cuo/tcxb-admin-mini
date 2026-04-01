package com.tcxueban.dao;

import com.tcxueban.entity.StudySchedule;

import java.util.List;

public interface StudyScheduleDao {

    int addSchedule(StudySchedule schedule);

    List<StudySchedule> getUpcomingByUserId(Integer userId);

    List<StudySchedule> getHistoryByUserId(Integer userId);

    int updateStatus(Integer scheduleId, Integer status);
}
