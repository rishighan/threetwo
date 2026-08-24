import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Cover } from "./Cover";

interface SortableCoverProps {
  url: string;
  index: number;
  faded?: boolean;
}

export const SortableCover = (props: SortableCoverProps) => {
  const sortable = useSortable({ id: props.url });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Cover
      ref={setNodeRef}
      style={style}
      {...props}
      {...attributes}
      {...listeners}
    />
  );
};
