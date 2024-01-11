import { DragOverEvent } from '@dnd-kit/core';
import React from 'react';
import { findContainer, getNextContainerId } from '../utilities';
import { arrayMove } from '@dnd-kit/sortable';
import { unstable_batchedUpdates } from 'react-dom';
import { CoursesBySemesterID, SemesterOrder } from '@/types/models';
import { useScheduleStore } from '@/lib/hooks/stores/useScheduleStore';
import useDnDAuxiliaryStore from '@/lib/hooks/stores/useDnDAuxaliaryStore';
import { PLACEHOLDER_ID, TRASH_ID } from '@/lib/constants';

export default function useDragHandlers(
  clonedItems: CoursesBySemesterID | null,
  setClonedItems: React.Dispatch<React.SetStateAction<CoursesBySemesterID | null>>,
) {

  const state = useScheduleStore();
  const {
    semesterOrder,
    setSemesterOrder,
    coursesBySemesterID,
    setCoursesBySemesterID,
  } = state;

  const recentlyMovedToNewContainer = useDnDAuxiliaryStore((state) => state.recentlyMovedToNewContainer);
  const activeId = useDnDAuxiliaryStore((state) => state.activeID);
  const setActiveId = useDnDAuxiliaryStore((state) => state.setActiveID);

  const items = coursesBySemesterID;
  const containers = semesterOrder;

  const setItemsWrapper = (items: CoursesBySemesterID) => {
    setCoursesBySemesterID(items);
  }

  const setSemesterOrderWrapper = (containers: SemesterOrder) => {
    setSemesterOrder(containers);
  }

  const handleDragOver = (event: DragOverEvent) => {
    console.log('drag over');
    const { active, over } = event;
    const overId = over?.id;

    if (overId == null || overId === TRASH_ID || active.id in items) {
      return;
    }

    const overContainer = findContainer(items, overId);
    const activeContainer = findContainer(items, active.id);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      const activeItems = items[activeContainer];
      const overItems = items[overContainer];
      const overIndex = overItems.indexOf(overId);
      const activeIndex = activeItems.indexOf(active.id);

      let newIndex: number;

      if (overId in items) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
          over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;

        newIndex =
          overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      if (recentlyMovedToNewContainer === null) {
        console.error("recentlyMovedToNewContainer is null! Was it set correctly with useRef?");
        return;
      }

      recentlyMovedToNewContainer.current = true;

      setItemsWrapper({
        ...items,
        [activeContainer]: items[activeContainer].filter(
          (item) => item !== active.id
        ),
        [overContainer]: [
          ...items[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...items[overContainer].slice(
            newIndex,
            items[overContainer].length
          ),
        ],
      });

    }
  }


  const handleDragEnd = (event: DragOverEvent) => {
    console.log('drag end 0');
    const { active, over } = event;

    if (active.id in items && over?.id) {

      const activeIndex = containers.indexOf(active.id);
      const overIndex = containers.indexOf(over.id);

      setSemesterOrderWrapper(arrayMove(containers, activeIndex, overIndex));

    }

    console.log('drag end 1');

    const activeContainer = findContainer(items, active.id);

    if (!activeContainer) {
      setActiveId("");
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      setActiveId("");
      return;
    }

    console.log('drag end 2');

    if (overId === TRASH_ID) {
      setItemsWrapper({
        ...items,
        [activeContainer]: items[activeContainer].filter(
          (id) => id !== activeId
        ),
      });
      setActiveId("");
      return;
    }

    if (overId === PLACEHOLDER_ID) {
      const newContainerId = getNextContainerId(
        items
      );

      unstable_batchedUpdates(() => {
        setSemesterOrderWrapper([...containers, newContainerId]);
        setItemsWrapper({
          ...items,
          [activeContainer]: items[activeContainer].filter(
            (id) => id !== activeId
          ),
          [newContainerId]: [active.id],
        });
        setActiveId("");
      });
      return;
    }

    console.log('drag end 3');

    const overContainer = findContainer(items, overId);

    if (overContainer) {
      const activeIndex = items[activeContainer].indexOf(active.id);
      const overIndex = items[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        setItemsWrapper({
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
        });
      }
    }
    setActiveId("");
  }

  const handleDragStart = (event: DragOverEvent) => {
    console.log('test');
    const { active } = event;
    setActiveId(active.id);
    setClonedItems(items);
  }

  const handleDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItemsWrapper(clonedItems);
    }

    setActiveId("");
    setClonedItems(null);
  };
  return {
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleDragStart,
  }
}