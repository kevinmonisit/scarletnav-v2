import { closestCenter, pointerWithin, rectIntersection, getFirstCollision, Active, DroppableContainer, CollisionDetection, UniqueIdentifier, DragOverEvent } from "@dnd-kit/core";
import { Items } from "../types";
import { findContainer, getNextContainerId } from "./utilities";
import { unstable_batchedUpdates } from "react-dom";
import { arrayMove } from "@dnd-kit/sortable";


/**
 * Custom collision detection strategy optimized for multiple containers
  *
  * - First, find any droppable containers intersecting with the pointer.
  * - If there are none, find intersecting containers with the active draggable.
  * - If there are no intersecting containers, return the last matched intersection
  *
*/
export const collisionDetectionStrategy = (
  args: Parameters<CollisionDetection>[0],
  activeId: UniqueIdentifier | null,
  lastOverId: React.MutableRefObject<UniqueIdentifier | null>,
  items: Items,
  TRASH_ID: string,
  recentlyMovedToNewContainer: React.MutableRefObject<boolean>
) => {
  if (activeId && activeId in items) {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => container.id in items
      ),
    });
  }

  // Start by finding any intersecting droppable
  const pointerIntersections = pointerWithin(args);
  const intersections =
    pointerIntersections.length > 0
      ? // If there are droppables intersecting with the pointer, return those
      pointerIntersections
      : rectIntersection(args);
  let overId = getFirstCollision(intersections, "id");

  if (overId != null) {
    if (overId === TRASH_ID) {
      // If the intersecting droppable is the trash, return early
      // Remove this if you're not using trashable functionality in your app
      return intersections;
    }

    if (overId in items) {
      const containerItems = items[overId];

      // If a container is matched and it contains items (columns 'A', 'B', 'C')
      if (containerItems.length > 0) {
        // Return the closest droppable within that container
        overId = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) =>
              container.id !== overId &&
              containerItems.includes(container.id)
          ),
        })[0]?.id;
      }
    }

    lastOverId.current = overId;

    return [{ id: overId }];
  }

  // When a draggable item moves to a new container, the layout may shift
  // and the `overId` may become `null`. We manually set the cached `lastOverId`
  // to the id of the draggable item that was moved to the new container, otherwise
  // the previous `overId` will be returned which can cause items to incorrectly shift positions
  if (recentlyMovedToNewContainer.current) {
    lastOverId.current = activeId;
  }

  // If no droppable is matched, return the last match
  return lastOverId.current ? [{ id: lastOverId.current }] : [];
}

export const handleDragOver = (
  event: DragOverEvent,
  items: Items,
  TRASH_ID: string,
  setItems: React.Dispatch<React.SetStateAction<Items>>,
  recentlyMovedToNewContainer: React.MutableRefObject<boolean>
) => {
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

export const handleDragEnd = (
  event: DragOverEvent,
  items: Items,
  TRASH_ID: string,
  activeId: UniqueIdentifier | null,
  PLACEHOLDER_ID: string,
  setContainers: React.Dispatch<React.SetStateAction<UniqueIdentifier[]>>,
  setActiveId: React.Dispatch<React.SetStateAction<UniqueIdentifier | null>>,
  setItems: React.Dispatch<React.SetStateAction<Items>>,
) => {
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

export const handleAddColumn = (
  setContainers: React.Dispatch<React.SetStateAction<UniqueIdentifier[]>>,
  setItems: React.Dispatch<React.SetStateAction<Items>>,
  items: Items,
) => {
  const newContainerId = getNextContainerId(items);

  unstable_batchedUpdates(() => {
    setContainers((containers) => [...containers, newContainerId]);
    setItems((items) => ({
      ...items,
      [newContainerId]: [],
    }));
  });
}

export const handleRemove = (
  containerID: UniqueIdentifier,
  setContainers: React.Dispatch<React.SetStateAction<UniqueIdentifier[]>>,
) => {
  setContainers((containers) =>
    containers.filter((id) => id !== containerID)
  );
}


