'use client';

import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { CourseByID, CoursesBySemesterID, ScheduleActions, ScheduleState, SemesterOrder } from '@/types/models'

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    console.log(name, 'has been retrieved')
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    console.log(name, 'with value', value, 'has been saved')
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    console.log(name, 'has been deleted')
    await del(name)
  },
}

export const useScheduleStore = create<ScheduleActions & ScheduleState>()(
  persist(
    (set, get) => ({
      semesterOrder: [],
      coursesBySemesterID: {},
      semesterByID: {},
      courses: {},
      setSemesterOrder: (semOrder: SemesterOrder) => {
        //todo: when a semester is deleted, remove it from
        //the general semester map

        set({
          "semesterOrder": semOrder
        })
      },
      setCoursesBySemesterID: (semesters: CoursesBySemesterID) => set({
        "coursesBySemesterID": semesters
      }),
      setCourses: (courses: CourseByID) => set({
        "courses": courses
      }),
    }),
    {
      name: 'schedule-state',
      storage: createJSONStorage(() => storage),
    },
  ),
);