'use client';

import { Course, Semester, SemesterOrder, ScheduleState, CourseID } from "@/types/models";
import { indexDB } from "../client/indexDB";

function createCourseArray() {
  return Array.from({ length: 5}, (_, i) => ({
    id: Math.random().toString(36).substring(7),
    name: `Course ${i}`,
    credits: 3,
  }));

}

const NUM_SEMESTERS = 3;

const allCourses: Course[][] = Array.from({ length: NUM_SEMESTERS}, (_, i) => createCourseArray());
const semesterArray: Semester[] = Array.from({ length: NUM_SEMESTERS}, (_, i) => ({
  id: `semester${i}`,
  courses: allCourses[i].map(course => course.id),
}));

const semesterOrder = semesterArray.map(semester => semester.id);

export const createDummySchedule = (): ScheduleState => {
  const courses = new Map<CourseID, Course>();

  allCourses.forEach(semester => {
    semester.forEach(course => {
      courses.set(course.id, course);
    });
  });

  const semesters = new Map(semesterArray.map(semester => [semester.id, semester]));
  return {
    semesterOrder,
    semesters,
    courses,
  };
}

export const getSchedule = async (): Promise<ScheduleState> => {
    await indexDB.initDB();

    const schedule = await indexDB.getSchedule();

    indexDB.setSchedule(createDummySchedule());

    if (!schedule) {
      console.log('no schedule found in indexDB, creating dummy schedule');
      return createDummySchedule();
    }

    return schedule;
}