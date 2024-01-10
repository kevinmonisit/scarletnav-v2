import { SemesterID } from '@/types/models';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useRef } from 'react';
import { create } from 'zustand';

type DnDHandleStore = {
  recentlyMovedToNewContainer: React.MutableRefObject<boolean> | null;
  activeID: SemesterID;
  setRecentlyMovedToNewContainer: (flag: React.MutableRefObject<boolean>) => void;
  setActiveID: (id: SemesterID) => void;
};

const useDnDHandleStore = create<DnDHandleStore>()((set) => ({
  recentlyMovedToNewContainer: null,
  activeID: "",
  setRecentlyMovedToNewContainer: (flag: React.MutableRefObject<boolean>) =>
    set({ recentlyMovedToNewContainer: flag }),
  setActiveID: (id: SemesterID) => {
    console.log('new active id', id);
    set({ activeID: id })
  },
}));

export default useDnDHandleStore;
