import { SemesterID } from '@/types/models';
import { create } from 'zustand';

type DragAndDropAuxiliaryState = {
  recentlyMovedToNewContainer: React.MutableRefObject<boolean> | null;
  activeID: SemesterID;
  setRecentlyMovedToNewContainer: (flag: React.MutableRefObject<boolean>) => void;
  setActiveID: (id: SemesterID) => void;
};

/**
 * Stores auxiliary state for the drag and drop functionality.
 */
const useDnDAuxiliaryStore = create<DragAndDropAuxiliaryState>()((set) => ({
  recentlyMovedToNewContainer: null,
  activeID: "",
  setRecentlyMovedToNewContainer: (flag: React.MutableRefObject<boolean>) =>
    set({ recentlyMovedToNewContainer: flag }),
  setActiveID: (id: SemesterID) => {
    console.log('new active id', id);
    set({ activeID: id })
  },
}));

export default useDnDAuxiliaryStore;
