import { UniqueIdentifier } from "@dnd-kit/core";

export enum STORE_NAMES {
  schedule = 'schedule',
  courses = 'courses',
  semesters = 'semesters',
}

type CourseID = string | UniqueIdentifier;
type SemesterID = string | UniqueIdentifier;
type SemesterOrder = SemesterID[];

export interface Semester {
  id: SemesterID;
  courses: CourseID[]; //ordered
}

export interface Course {
  id: CourseID;
  name: string;
  credits: number;
}

export interface ScheduleState {
  semesterOrder: SemesterOrder;
  semesters: Map<SemesterID, Semester>;
  courses: Map<CourseID, Course>;
}

export interface ScheduleActions {
  setSchedule(
    schedule: Semester,
    semesters: Map<SemesterID, Semester>,
    courses: Map<CourseID, Course>
  ): void,

  getSchedule(): ScheduleState,
}