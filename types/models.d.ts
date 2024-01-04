import { UniqueIdentifier } from "@dnd-kit/core";

enum STORE_NAMES {
  schedule = 'schedule',
  courses = 'courses',
  semesters = 'semesters',
}

type CourseID = string | UniqueIdentifier;
type SemesterID = string | UniqueIdentifier;
type Schedule = SemesterID[];

interface Semester {
  id: SemesterID;
  courses: CourseID[]; //ordered
}

interface Course {
  id: CourseID;
  name: string;
  credits: number;
}

interface ScheduleState {
  schedule: Schedule;
  semesters: Map<SemesterID, Semester>;
  courses: Map<CourseID, Course>;
}

interface ScheduleActions {
  setSchedule(
    schedule: Schedule,
    semesters: Map<SemesterID, Semester>,
    courses: Map<CourseID, Course>
  ): void,

  getSchedule(): ScheduleState,
}