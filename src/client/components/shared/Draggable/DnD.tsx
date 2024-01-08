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

export const DnD = (data) => {
  console.log(data.data);
  const [items, setItems] = useState(data.data);
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

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
          {map(items, (url, index) => {
            return (
              <div>
                <SortableCover key={url} url={url} index={index} />
                <div
                  className="mt-2 mb-2"
                  onClick={(e) => data.onClickHandler(url)}
                >
                  <div className="box p-2 pl-3 control-palette">
                    <span className="tag is-warning mr-2">{index}</span>
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
