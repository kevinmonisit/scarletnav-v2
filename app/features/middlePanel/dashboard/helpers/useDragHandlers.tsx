import { DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';
import React from 'react';
import { Items } from '../types';
import { findContainer, getNextContainerId } from './utilities';
import { arrayMove } from '@dnd-kit/sortable';
import { unstable_batchedUpdates } from 'react-dom';

export default function useDragHandlers(
  items: Items,
  TRASH_ID: string,
  activeId: UniqueIdentifier | null,
  PLACEHOLDER_ID: string,
  recentlyMovedToNewContainer: React.MutableRefObject<boolean>,
  clonedItems: Items | null,
  setClonedItems: React.Dispatch<React.SetStateAction<Items | null>>,
  setContainers: React.Dispatch<React.SetStateAction<UniqueIdentifier[]>>,
  setActiveId: React.Dispatch<React.SetStateAction<UniqueIdentifier | null>>,
  setItems: React.Dispatch<React.SetStateAction<Items>>
) {

  const handleDragOver = (event: DragOverEvent) => {
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
      setItems((items) => {
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

        recentlyMovedToNewContainer.current = true;

        return {
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
        };
      });
    }
  }


  const handleDragEnd = (event: DragOverEvent) => {
    const { active, over } = event;

    if (active.id in items && over?.id) {
      setContainers((containers) => {
        const activeIndex = containers.indexOf(active.id);
        const overIndex = containers.indexOf(over.id);

        return arrayMove(containers, activeIndex, overIndex);
      });
    }

    const activeContainer = findContainer(items, active.id);

    if (!activeContainer) {
      setActiveId(null);
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      setActiveId(null);
      return;
    }

    if (overId === TRASH_ID) {
      setItems((items) => ({
        ...items,
        [activeContainer]: items[activeContainer].filter(
          (id) => id !== activeId
        ),
      }));
      setActiveId(null);
      return;
    }

    if (overId === PLACEHOLDER_ID) {
      const newContainerId = getNextContainerId(
        items
      );

      unstable_batchedUpdates(() => {
        setContainers((containers) => [...containers, newContainerId]);
        setItems((items) => ({
          ...items,
          [activeContainer]: items[activeContainer].filter(
            (id) => id !== activeId
          ),
          [newContainerId]: [active.id],
        }));
        setActiveId(null);
      });
      return;
    }

    const overContainer = findContainer(items, overId);

    if (overContainer) {
      const activeIndex = items[activeContainer].indexOf(active.id);
      const overIndex = items[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        setItems((items) => ({
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
        }));
      }
    }

    setActiveId(null);
  }

  const handleDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  const handleAddColumn = () => {
    const newContainerId = getNextContainerId(items);

    unstable_batchedUpdates(() => {
      setContainers((containers) => [...containers, newContainerId]);
      setItems((items) => ({
        ...items,
        [newContainerId]: [],
      }));
    });
  }

  const handleRemove = (
    containerID: UniqueIdentifier,
  ) => {
    setContainers((containers) =>
      containers.filter((id) => id !== containerID)
    );
  }

  return {
    handleDragOver,
    handleDragEnd,
    handleAddColumn,
    handleRemove,
    handleDragCancel
  }
}