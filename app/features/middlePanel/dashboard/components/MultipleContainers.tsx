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
import { db } from "@/lib/client/db";
import { useScheduleStore } from "@/lib/stores/useScheduleStore";
import useDnDHandleStore from "@/lib/stores/useDnDHandleStore";
import useScheduleHandlers from "../helpers/useScheduleHandlers";

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

  const semesterOrder = useScheduleStore((state) => state.semesterOrder);
  const coursesBySemesterID = useScheduleStore((state) => state.coursesBySemesterID);

  const { recentlyMovedToNewContainer, activeID, setActiveID } = useDnDHandleStore((state) => {
    const { recentlyMovedToNewContainer, activeID, setActiveID } = state;

    return {
      recentlyMovedToNewContainer,
      activeID,
      setActiveID,
    }
  });

  const isSortingContainer = activeID ? semesterOrder.includes(activeID) : false;
  const {
    renderContainerDragOverlay,
    renderSortableItemDragOverlay
  } = useOverlayComponents(
    coursesBySemesterID,
    handle,
    renderItem,
    getColor,
    getItemStyles,
    wrapperStyle,
  );

  const {
    handleAddColumn,
    handleRemove,
  } = useScheduleHandlers();


  useEffect(() => {
    requestAnimationFrame(() => {
      if (recentlyMovedToNewContainer == null) {
        console.error('recentlyMovedToNewContainer is null! Was it set correctly with useRef?');
        return;
      }

      console.log('recentlyMovedToNewContainer.current', recentlyMovedToNewContainer.current);

      recentlyMovedToNewContainer.current = false;
    });
  }, [coursesBySemesterID, recentlyMovedToNewContainer]);

  return (
    <>
      <div
        style={{
          display: "inline-grid",
          boxSizing: "border-box",
          padding: 20,
          gridAutoFlow: vertical ? "row" : "column",
        }}
      >
        <SortableContext
          items={[...semesterOrder, PLACEHOLDER_ID]}
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
            {semesterOrder.map((containerId) => (
              <DroppableContainer
                key={containerId}
                id={containerId}
                label={minimal ? undefined : `Column ${containerId}`}
                columns={columns}
                items={coursesBySemesterID[containerId]}
                scrollable={scrollable}
                style={containerStyle}
                unstyled={minimal}
                onRemove={() => handleRemove(containerId)}
              >
                <SortableContext items={coursesBySemesterID[containerId]} strategy={strategy}>
                  {coursesBySemesterID[containerId].map((value, index) => {
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
                          return getIndex(coursesBySemesterID, id);
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
          {activeID
            ? semesterOrder.includes(activeID)
              ? renderContainerDragOverlay(activeID)
              : renderSortableItemDragOverlay(activeID)
            : null}
        </DragOverlay>,
        document.body
      )}
    </>
  );
}
