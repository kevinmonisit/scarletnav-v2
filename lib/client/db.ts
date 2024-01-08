// db.ts
import Dexie, { Table } from 'dexie';
import { Course, Semester, SemesterOrder } from '@/types/models';
import { createDummySchedule } from '../api/scheduleAPI';
import { dashboardOverviewState } from '@/app/features/middlePanel/dashboard/types';

export const DB_NAME = 'USER_SCHEDULE';
const DB_VERSION = 1;

interface SemesterOrderSave {
  semesterOrder: SemesterOrder;
}


export class UserScheduleDatabase extends Dexie {
  semesters!: Table<Semester>;
  schedule!: Table<SemesterOrderSave>;
  courses!: Table<Course>;

  /**
   * TODO: Make primary keys auto-incremented instead of assigning for
   * possible naming collisions
   */

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      semesters: 'id',
      schedule: 'id',
      courses: 'id' // Primary key and indexed props
    });
  }

  async populate() {
    const dummy = createDummySchedule();

    // convert 'Map<SemesterID, Semester>' to an array
    const semesters = Array.from(dummy.semesters.values());
    const courses = Array.from(dummy.courses.values());


    await this.semesters.bulkAdd(semesters);
    await this.courses.bulkAdd(courses);
    await this.schedule.add({
      semesterOrder: dummy.semesterOrder
    });
  }

  async setSemesters(items: dashboardOverviewState) {
    const semesters = Object.entries(items).map(([id, courses]) => ({
      id,
      courses
    }));

    console.log(semesters);

    db.transaction('rw', db.semesters, async ()=>{
      await db.semesters.clear();
      await db.semesters.bulkAdd(semesters);
    }).catch(err => {
        console.error(err.stack);
    });
  }

  async setSemesterOrder(semesterOrder: SemesterOrder) {
    console.log(semesterOrder);
    db.schedule.update('schedule', {"semesterOrder": semesterOrder}).then(function (updated) {
      if (updated)
        console.log("Updated semesterOrder to: " + semesterOrder);
      else
        console.log("Nothing was updated - there were no semesterOrder");
    });
  }
}

export const db = new UserScheduleDatabase();