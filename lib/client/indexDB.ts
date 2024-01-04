'use client';

import { STORE_NAMES, ScheduleState } from '@/types/models.d';
import idb from 'idb';

const DB_NAME = 'USER_SCHEDULE';
const DB_VERSION = 1;
let db: idb.IDBPDatabase<unknown>;

const STORE_NAME_ARRAY = Object.values(STORE_NAMES);

window.addEventListener('unhandledrejection', event => {
  let request = event.target;
  let error = event.reason;

  console.error('error', error);
  console.error('request', request);
});

async function setupIndexDB(db: idb.IDBPDatabase) {
  STORE_NAME_ARRAY.forEach(store => {
    if (!db.objectStoreNames.contains(store)) {
      db.createObjectStore(store, { keyPath: 'id' });
    }
  });
}

async function initDB() {
  db = await idb.openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      setupIndexDB(db);
    },
  });
}

const createTransaction = () => {
  const tx = db.transaction(STORE_NAME_ARRAY, 'readwrite');
  const scheduleStore = tx.objectStore(STORE_NAMES.schedule);
  const coursesStore = tx.objectStore(STORE_NAMES.courses);
  const semestersStore = tx.objectStore(STORE_NAMES.semesters);

  return {
    tx,
    scheduleStore,
    coursesStore,
    semestersStore,
  };
}

async function setSchedule(scheduleState: ScheduleState) {
  if(!db) await initDB();

  const { schedule, semesters, courses } = scheduleState;

  const semesterArray = Array.from(semesters.values());
  const courseArray = Array.from(courses.values());
  const { tx, scheduleStore, coursesStore, semestersStore } = createTransaction();

  try {
    await scheduleStore.put(schedule, 'schedule');
    await coursesStore.clear();
    await semestersStore.clear();

    const semesterPromises = semesterArray.map(semester => semestersStore.put(semester));
    await Promise.all(semesterPromises);

    const coursePromises = courseArray.map(course => coursesStore.put(course));
    await Promise.all(coursePromises);

    await tx.done;

  } catch(err) {
    console.error(err);
  }
}

async function getSchedule(): Promise<ScheduleState | undefined> {
  if(!db) await initDB();

  const { tx, scheduleStore, coursesStore, semestersStore } = createTransaction();

  try {
    const schedule = await scheduleStore.get('schedule');
    const coursesArray = await coursesStore.getAll();
    const semestersArray = await semestersStore.getAll();

    const courses = new Map(coursesArray.map(course => [course.id, course]));
    const semesters = new Map(semestersArray.map(semester => [semester.id, semester]));

    return {
      schedule,
      courses,
      semesters,
    };
  } catch(err) {
    console.error(err);
  }

  return undefined;
}


const indexDB = {
  initDB,
  setSchedule,
  getSchedule,
};

export { indexDB };
