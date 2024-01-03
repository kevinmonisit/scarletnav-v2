import { UniqueIdentifier } from '@dnd-kit/core';
import React, { useCallback } from 'react';
import { Items } from '../types';
import { Container, Item } from '../components/ui';
import { findContainer, getIndex } from './utilities';

export default function useOverlayComponents(
  items: Items,
  columns: number | undefined,
  handle: boolean,
  renderItem: () => React.ReactElement,
  getColor: (id: UniqueIdentifier) => string | undefined,
  getItemStyles: (args: any) => React.CSSProperties,
  wrapperStyle: (args: any) => React.CSSProperties,
) {

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    return (
      <Item
        value={id}
        handle={handle}
        style={getItemStyles({
          containerId: findContainer(items, id) as UniqueIdentifier,
          overIndex: -1,
          index: getIndex(items, id),
          value: id,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true,
        })}
        color={getColor(id)}
        wrapperStyle={wrapperStyle({ index: 0 })}
        renderItem={renderItem}
        dragOverlay
      />
    );
  }

  function renderContainerDragOverlay(
    containerId: UniqueIdentifier,
  ) {
    return (
      <Container
        label={`Column ${containerId}`}
        columns={columns}
        style={{
          height: "100%",
        }}
        shadow
        unstyled={false}
      >
        {items[containerId].map((item, index) => (
          <Item
            key={item}
            value={item}
            handle={handle}
            style={getItemStyles({
              containerId,
              overIndex: -1,
              index: getIndex(items, item),
              value: item,
              isDragging: false,
              isSorting: false,
              isDragOverlay: false,
            })}
            color={getColor(item)}
            wrapperStyle={wrapperStyle({ index })}
            renderItem={renderItem}
          />
        ))}
      </Container>
    );
  }



  return {
    renderSortableItemDragOverlay,
    renderContainerDragOverlay,
  }
}



