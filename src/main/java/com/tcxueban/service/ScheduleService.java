package com.tcxueban.service;

import com.tcxueban.entity.StudySchedule;

import java.util.List;

public interface ScheduleService {

    boolean addSchedule(Integer userId, Integer partnerUserId, String course,
                        String studyDate, String studyTime, String studyPlace);

    List<StudySchedule> getUpcoming(Integer userId);

    List<StudySchedule> getHistory(Integer userId);
}
