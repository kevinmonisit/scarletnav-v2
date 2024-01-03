'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal, unstable_batchedUpdates } from "react-dom";
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
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  SortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { coordinateGetter as multipleContainersCoordinateGetter } from "./multipleContainersKeyboardCoordinates";
import { Container, ContainerProps } from "./ui/index";
import SortableItem from "./SortableItem";
import { createRange, getColor, dropAnimation, animateLayoutChanges, getIndex, findContainer } from "../helpers/utilities";
import { Items } from "../types";
import { collisionDetectionStrategy as detectionStrategy } from "../helpers/logic";
import useOverlayComponents from "../helpers/useOverlayComponents";
import useDragHandlers from "../helpers/useDragHandlers";

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "container") ||
    items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
}


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
  const [items, setItems] = useState<Items>(
    () =>
      initialItems ?? {
        A: createRange(itemCount, (index) => `A${index + 1}`),
        B: createRange(itemCount, (index) => `B${index + 1}`),
        C: createRange(itemCount, (index) => `C${index + 1}`),
        D: createRange(itemCount, (index) => `D${index + 1}`),
      }
  );
  const [containers, setContainers] = useState(
    Object.keys(items) as UniqueIdentifier[]
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const { renderSortableItemDragOverlay, renderContainerDragOverlay } = useOverlayComponents(
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
    setContainers,
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

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

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
          items={[...containers, PLACEHOLDER_ID]}
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
            {containers.map((containerId) => (
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
            ? containers.includes(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
