import { UniqueIdentifier } from '@dnd-kit/core';
import React, { forwardRef, useEffect } from 'react';
import { useBearStore } from './App';
import clsx from 'clsx';

interface Props {
  id: UniqueIdentifier;
  isOverlay?: boolean;
}
export type Ref = HTMLDivElement;

export const Item = forwardRef<Ref, Props>(function Item({
  id,
  isOverlay = false,
  ...props }, ref) {
  const activeId = useBearStore((state) => state.activeId);

  useEffect(() => {
    console.log('Item', activeId, id);
  }, [activeId]);

  return (
    <div {...props}
      ref={ref}
      className={
        clsx(
          'bg-gray-50 w-40 h-80',
          {
            'invisible': activeId !== null && activeId === id && !isOverlay,
          },
        )
      }
    >
      {id}
    </div>
  )
});