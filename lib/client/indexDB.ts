'use client';

import { STORE_NAMES, ScheduleState } from '@/types/models.d';
import {IDBPDatabase, openDB, deleteDB } from 'idb';

type dbType = IDBPDatabase<unknown> | undefined;

const DB_NAME = 'USER_SCHEDULE';
const DB_VERSION = 10;
let db: dbType = undefined;

const STORE_NAME_ARRAY = Object.values(STORE_NAMES);

window.addEventListener('unhandledrejection', event => {
  let request = event.target;
  let error = event.reason;

  console.error('error', error);
  console.error('request', request);
});

async function initializeStores(db: dbType) {
  if(db == null) {
    throw new Error('db is undefined');
  }

  STORE_NAME_ARRAY.forEach(store => {
    if (!db!.objectStoreNames.contains(store)) {
      db!.createObjectStore(store, { keyPath: 'id' });
    }
  });
}

export async function resetDB() {
  await deleteDB(DB_NAME);
  await initializeStores(db);
}

async function initDB() {
  if(db != null) {
    console.log("db already initialized");
    return;
  }

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(_db, _oldVersion, _newVersion, _transaction) {
      console.log('upgrading db');
      initializeStores(_db);
    },
    blocked() {
      console.log('db blocked');
    },
  });

  return db;
}

const createTransaction = async () => {
  if (db == null) {
    await initDB();
  }

  const tx = db!.transaction(STORE_NAME_ARRAY, 'readwrite');
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
  if (db === undefined) {
    await initDB();
  }

  const { semesterOrder, semesters, courses } = scheduleState;

  const semesterArray = Array.from(semesters.values());
  const courseArray = Array.from(courses.values());

  try {
    const { tx, scheduleStore, coursesStore, semestersStore } = await createTransaction();
    console.log(semesterOrder);
    console.log(semesters);
    console.log(courses);

    console.log(semesterArray);

    await scheduleStore.put(semesterOrder, STORE_NAMES.schedule);
    await coursesStore.clear();
    await semestersStore.clear();

    const semesterPromises = semesterArray.map(semester => semestersStore.put(semester, STORE_NAMES.semesters));
    const coursePromises = courseArray.map(course => coursesStore.put(course, STORE_NAMES.courses));

    console.log('promises ', semesterPromises);

    await Promise.all(semesterPromises);
    await Promise.all(coursePromises);

    await tx.done;

  } catch(err) {
    console.error(err);
  }
}

async function getSchedule(): Promise<ScheduleState | undefined> {
  if (db == null) {
    await initDB();
  }

  try {
    const { tx, scheduleStore, coursesStore, semestersStore } = await createTransaction();

    const semesterOrder = await scheduleStore.get(STORE_NAMES.schedule);
    const coursesArray = await coursesStore.getAll();
    const semestersArray = await semestersStore.getAll();

    const courses = new Map(coursesArray.map(course => [course.id, course]));
    const semesters = new Map(semestersArray.map(semester => [semester.id, semester]));

    return {
      semesterOrder,
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
  resetDB,
};

export { indexDB };
