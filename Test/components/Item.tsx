import { UniqueIdentifier } from '@dnd-kit/core';
import React, { forwardRef, useEffect, useState } from 'react';
import { useBearStore } from './App';
import clsx from 'clsx';
import { SortableContext } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface Props {
  id: UniqueIdentifier;
  isOverlay?: boolean;
  smaller?: boolean;
}
export type Ref = HTMLDivElement;

export const Item = forwardRef<Ref, Props>(function Item({
  id,
  isOverlay = false,
  smaller = false,
  ...props }, ref) {
  const activeId = useBearStore((state) => state.activeId);

  const [items, setTimes] = useState(['A', 'B', 'C'].map((item_id) =>
  (
    item_id.concat(id.toString())
  )
  ));

  console.log('re-rendering');

  useEffect(() => {
    console.log('Item', activeId, id);
  }, [activeId]);

  return (
    <div {...props}
      ref={ref}
      className={
        clsx(
          'bg-gray-50 w-40 flex flex-col',
          {
            'invisible': activeId !== null && activeId === id && !isOverlay,
          },
          {
            'h-80': !smaller,
          },
          {
            'h-40': smaller,
          }
        )
      }
    >
      <div className="w-full h-10 bg-red-300">{id}</div>
      <SortableContext items={items} >
        <div
          className="w-full flex flex-col gap-4 bg-green-400 z-50"
        >
          {items.map(_id => <div className="w-full h-4 bg-gray-400" key={_id} />)}
        </div>
      </SortableContext>
    </div>
  )
});