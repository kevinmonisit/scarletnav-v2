'use client';

import { Course, Semester, Schedule, ScheduleState, CourseID } from "@/types/models";

function createCourseArray() {
  return Array.from({ length: 5}, (_, i) => ({
    id: Math.random().toString(36).substring(7),
    name: `Course ${i}`,
    credits: 3,
  }));

}

const NUM_SEMESTERS = 12;

const allCourses: Course[][] = Array.from({ length: NUM_SEMESTERS}, (_, i) => createCourseArray());
const semesterArray: Semester[] = Array.from({ length: NUM_SEMESTERS}, (_, i) => ({
  id: `semester${i}`,
  courses: allCourses[i].map(course => course.id),
}));

const schedule: Schedule = semesterArray.map(semester => semester.id);

export const getSchedule = (): ScheduleState => {
  const courses = new Map<CourseID, Course>();

  allCourses.forEach(semester => {
    semester.forEach(course => {
      courses.set(course.id, course);
    });
  });

  const semesters = new Map(semesterArray.map(semester => [semester.id, semester]));
  return {
    schedule,
    semesters,
    courses,
  };
}