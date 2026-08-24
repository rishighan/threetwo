import React, { ReactElement, useState } from "react";
// https://codesandbox.io/s/dndkit-sortable-image-grid-py6ve?file=/src/Grid.jsx
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { Grid } from "./Grid";
import { SortableCover } from "./SortableCover";
import { Cover } from "./Cover";
import { map } from "lodash";

interface DnDProps {
  data: string[];
  onClickHandler: (url: string) => void;
}

export const DnD = ({ data, onClickHandler }: DnDProps) => {
  const [items, setItems] = useState<string[]>(data);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items: string[]) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  }

  function handleDragCancel() {
    setActiveId(null);
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <Grid columns={4}>
          {map(items, (url: string, index: number) => {
            return (
              <div key={url}>
                <SortableCover url={url} index={index} />
                <div
                  className="mt-2 mb-2"
                  onClick={() => onClickHandler(url)}
                >
                  <div className="box p-2 control-palette">
                    <span className="tag is-warning mr-2">{index}</span>
                    {/* TODO: Switch to Solar icons */}
                    <span className="icon is-small mr-2">
                      <i className="fa-solid fa-vial"></i>
                    </span>
                    <span className="icon is-small mr-2">
                      <i className="fa-solid fa-bullseye"></i>
                    </span>
                    <span className="icon is-small mr-2">
                      <i className="fa-regular fa-trash-can"></i>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </Grid>
      </SortableContext>
      <DragOverlay adjustScale={true}>
        {activeId ? (
          <Cover url={activeId} index={items.indexOf(activeId)} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DnD;
