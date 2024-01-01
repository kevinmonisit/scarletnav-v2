'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
  DragCancelEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import Grid from '@/app/components/Grid';
import { Item } from '@/app/components/Item';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface BearState {
  activeId: UniqueIdentifier | null;
  setID: (id: UniqueIdentifier | null) => void;
}

export const useBearStore = create<BearState>()(
  devtools(
    (set) => ({
      activeId: null,
      setID: (id) => set(() => ({ activeId: id })),
    }),
    {
      name: 'bear-storage',
    },
  ),
);

export default function App() {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const setStoreID = useBearStore((state) => state.setID);
  const getActiveID = useBearStore((state) => state.activeId);
  const [items, setItems] = useState(['A', 'B', 'C']);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={items}
        strategy={rectSortingStrategy}
      >
        <Grid columns={2}>
          {items.map(id => <SortableItem key={id} id={id} />)}
        </Grid>
      </SortableContext>
      <DragOverlay>
        {activeId ? <Item id={activeId} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );

  function handleDragStart(event: DragStartEvent) {
    console.log('handle drag start');
    const { active } = event;
    setStoreID(active.id);
    setActiveId(active.id);
  }

  function handleDragCancel(event: DragCancelEvent) {
    console.log("cancelled");
    setStoreID(null);
    setActiveId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    console.log('drag end');
    setStoreID(null);
    setActiveId(null);

    console.log('ended!');

    console.log(getActiveID);
    const { active, over } = event;

    if (!over || !active) {
      console.warn('something went wrong in handleDragEnd');
      return;
    }

    if (active.id !== over.id) {
      setItems((items) => {
        const activeId = active.id.toString();
        const overId = over.id.toString();

        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);

        return arrayMove(items, oldIndex, newIndex);
      });

      // useBearStore.setState({ activeId: null });
    }
  }
}