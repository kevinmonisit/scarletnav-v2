import { DropAnimation, UniqueIdentifier, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { AnimateLayoutChanges, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { Items } from "../types";

const defaultInitializer = (index: number) => index;

export function createRange<T = number>(
  length: number,
  initializer: (index: number) => any = defaultInitializer
): T[] {
  return [...new Array(length)].map((_, index) => initializer(index));
}

export function getColor(id: UniqueIdentifier) {
  switch (String(id)[0]) {
    case "A":
      return "#7193f1";
    case "B":
      return "#ffda6c";
    case "C":
      return "#00bcd4";
    case "D":
      return "#ef769f";
  }

  return undefined;
}

export const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });


export const findContainer = (
  items: Items,
  id: UniqueIdentifier
) => {
  if (id in items) {
    return id;
  }

  return Object.keys(items).find((key) => items[key].includes(id));
};

export const getIndex = (
  items: Items,
  id: UniqueIdentifier
) => {
  const container = findContainer(items, id);

  if (!container) {
    return -1;
  }

  const index = items[container].indexOf(id);

  return index;
}

export const getNextContainerId = (
  items: Items
) => {
  const containerIds = Object.keys(items);
  const lastContainerId = containerIds[containerIds.length - 1];

  return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
}