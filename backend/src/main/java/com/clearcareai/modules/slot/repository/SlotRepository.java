package com.clearcareai.modules.slot.repository;

import com.clearcareai.modules.slot.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByDoctorId(Long doctorId);

    List<Slot> findByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);

    List<Slot> findByDoctorIdAndIsActiveTrue(Long doctorId);

    List<Slot> findByDoctorIdAndDayOfWeekAndIsActiveTrue(Long doctorId, DayOfWeek dayOfWeek);
}
