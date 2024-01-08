'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CancelDrop,
  CollisionDetection,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  Modifiers,
  UniqueIdentifier,
  useSensors,
  useSensor,
  MeasuringStrategy,
  KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  SortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { coordinateGetter as multipleContainersCoordinateGetter } from "./multipleContainersKeyboardCoordinates";
import SortableItem from "./SortableItem";
import { getColor, dropAnimation, getIndex } from "../helpers/utilities";
import { Items, dashboardOverviewState } from "../types";
import { collisionDetectionStrategy as detectionStrategy } from "../helpers/logic";
import useOverlayComponents from "../helpers/useOverlayComponents";
import useDragHandlers from "../helpers/useDragHandlers";
import DroppableContainer from "./DroppableContainer";
import { getSchedule } from "@/lib/api/scheduleAPI";
import { db } from "@/lib/client/db";
import { useLiveQuery } from "dexie-react-hooks";
import { ScheduleState, Semester } from "@/types/models";

interface Props {
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: { index: number }): React.CSSProperties;
  itemCount?: number;
  items?: Items;
  handle?: boolean;
  renderItem?: any;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
}

export const TRASH_ID = "void";
const PLACEHOLDER_ID = "placeholder";
const empty: UniqueIdentifier[] = [];

export function MultipleContainers({
  adjustScale = false,
  itemCount = 3,
  cancelDrop,
  columns,
  handle = false,
  items: initialItems,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable,
}: Props) {
  const [items, setItems] = useState<dashboardOverviewState>({});
  const [schedule, setSchedule] = useState<UniqueIdentifier[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const isSortingContainer = activeId ? schedule.includes(activeId) : false;
  const {
    renderSortableItemDragOverlay,
    renderContainerDragOverlay
  } = useOverlayComponents(
    items,
    columns,
    handle,
    renderItem,
    getColor,
    getItemStyles,
    wrapperStyle,
  );

  const {
    handleDragOver,
    handleDragEnd,
    handleRemove,
    handleAddColumn,
    handleDragCancel
  } = useDragHandlers(
    items,
    TRASH_ID,
    activeId,
    PLACEHOLDER_ID,
    recentlyMovedToNewContainer,
    clonedItems,
    setClonedItems,
    setSchedule,
    setActiveId,
    setItems,
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => detectionStrategy(
      args,
      activeId,
      lastOverId,
      items,
      TRASH_ID,
      recentlyMovedToNewContainer
    ),
    [activeId, items]
  );

  // const _ = useLiveQuery(() => db.courses.toArray());

  useLiveQuery(async () => {
    console.log('test from live query');
    const courses = await db.courses.toArray();
    const semesters = await db.semesters.toArray();
    const schedule = await db.schedule.toArray();

    const data: dashboardOverviewState = {};
    semesters.forEach((semester) => {
      const { id, courses } = semester;

      data[id] = [...courses];
    });

    console.log(data);
    console.log(schedule[0]);

    setItems(data);
    setSchedule(schedule[0].semesterOrder);
    // setSchedule);
    setLoadingCourses(false);
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  if (loadingCourses) {
    return <div>Loading...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        setActiveId(active.id);
        setClonedItems(items);
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      cancelDrop={cancelDrop}
      onDragCancel={handleDragCancel}
      modifiers={modifiers}
    >
      <div
        style={{
          display: "inline-grid",
          boxSizing: "border-box",
          padding: 20,
          gridAutoFlow: vertical ? "row" : "column",
        }}
      >
        <SortableContext
          items={[...schedule, PLACEHOLDER_ID]}
          strategy={rectSortingStrategy}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              maxWidth: "900px",
              margin: "100px auto",
            }}
          >
            {schedule.map((containerId) => (
              <DroppableContainer
                key={containerId}
                id={containerId}
                label={minimal ? undefined : `Column ${containerId}`}
                columns={columns}
                items={items[containerId]}
                scrollable={scrollable}
                style={containerStyle}
                unstyled={minimal}
                onRemove={() => handleRemove(containerId)}
              >
                <SortableContext items={items[containerId]} strategy={strategy}>
                  {items[containerId].map((value, index) => {
                    return (
                      <SortableItem
                        disabled={isSortingContainer}
                        key={value}
                        id={value}
                        index={index}
                        handle={handle}
                        style={getItemStyles}
                        wrapperStyle={wrapperStyle}
                        renderItem={renderItem}
                        containerId={containerId}
                        getIndex={(id) => {
                          return getIndex(items, id);
                        }}
                      />
                    );
                  })}
                </SortableContext>
              </DroppableContainer>
            ))}
            {minimal ? undefined : (
              <DroppableContainer
                id={PLACEHOLDER_ID}
                disabled={isSortingContainer}
                items={empty}
                onClick={handleAddColumn}
                placeholder
              >
                + Add column
              </DroppableContainer>
            )}
          </div>
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {activeId
            ? schedule.includes(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
