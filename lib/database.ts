



const courseArray: Course[] = Array.from({ length: 10}, (_, i) => ({
  id: `course${i}`,
  name: `Course ${i}`,
  credits: 3,
}));

const semesterArray: Semester[] = Array.from({ length: 5}, (_, i) => ({
  id: `semester${i}`,
  courses: courseArray.slice(i, i + 2).map(course => course.id),
}));

const schedule: Schedule = {
  semesters: semesterArray.map(semester => semester.id),
};

export const getSchedule = (): ScheduleState => {
  const courses = new Map(courseArray.map(course => [course.id, course]));
  const semesters = new Map(semesterArray.map(semester => [semester.id, semester]));
  return {
    schedule,
    semesters,
    courses,
  };
}