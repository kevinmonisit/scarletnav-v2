
type CourseID = string;
type SemesterID = string;

interface Schedule {
  semesters: SemesterID[]; //ordered
}

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