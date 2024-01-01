'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UniqueIdentifier } from '@dnd-kit/core';
import { Item } from './Item';
import { useBearStore } from '@/app/components/App';

export function SortableItem(props: { id: UniqueIdentifier; }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  /**
   * Aria attributes are not correct.
   * Describedby is set to DndDescribedBy-1, but is used to suppress warnings.
   */
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      aria-describedby='DndDescribedBy-1'
      {...listeners}
    >
      <Item id={props.id} />
    </div>
  );
}
