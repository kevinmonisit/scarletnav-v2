'use client';

import { MiddlePanel } from '@/app/features/middlePanel/MiddlePanel';
import App from '@/app/features/middlePanel/dashboard/ScheduleBoard';
import { coordinateGetter } from '@/app/features/middlePanel/dashboard/components/multipleContainersKeyboardCoordinates';
import { collisionDetectionStrategy as detectionStrategy } from '@/app/features/middlePanel/dashboard/helpers/logic';
import useDragHandlers from '@/app/features/middlePanel/dashboard/helpers/useDragHandlers';
import useDnDHandleStore from '@/lib/stores/useDnDHandleStore';
import { useScheduleStore } from '@/lib/stores/useScheduleStore';
import { CoursesBySemesterID } from '@/types/models';
import { CollisionDetection, DndContext, KeyboardSensor, MeasuringStrategy, MouseSensor, TouchSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { useCallback, useEffect, useRef, useState } from 'react';


export const TRASH_ID = "void";
const PLACEHOLDER_ID = "placeholder";
const empty: UniqueIdentifier[] = [];

const Page: React.FC = () => {

  const scheduleState = useScheduleStore();
  const {
    setRecentlyMovedToNewContainer,
    recentlyMovedToNewContainer,
    activeID,
    setActiveID } = useDnDHandleStore((state) => {
      const {
        recentlyMovedToNewContainer,
        activeID,
        setActiveID,
        setRecentlyMovedToNewContainer } = state;

      return {
        recentlyMovedToNewContainer,
        setRecentlyMovedToNewContainer,
        activeID,
        setActiveID,
      }
    });

  const recentlyMovedToNewContainerInstance = useRef(false);

  useEffect(() => {
    console.log('setting recentlyMovedToNewContainer to false');
    setRecentlyMovedToNewContainer(recentlyMovedToNewContainerInstance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const [clonedItems, setClonedItems] = useState<CoursesBySemesterID | null>(null);

  const {
    semesterOrder,
    coursesBySemesterID,
    setSemesterOrder,
    setCoursesBySemesterID,
  } = scheduleState;

  const {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragHandlers(
    coursesBySemesterID,
    TRASH_ID,
    activeID,
    PLACEHOLDER_ID,
    recentlyMovedToNewContainer,
    clonedItems,
    semesterOrder,
    setClonedItems,
    setSemesterOrder,
    setActiveID,
    setCoursesBySemesterID,
  );

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => detectionStrategy(
      args,
      activeID,
      lastOverId,
      coursesBySemesterID,
      TRASH_ID,
      recentlyMovedToNewContainer
    ),
    [activeID, coursesBySemesterID, recentlyMovedToNewContainer]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div>
        <h1>Dashboard Page Test</h1>
        <MiddlePanel />
      </div>
    </DndContext>
  );
};

export default Page;
