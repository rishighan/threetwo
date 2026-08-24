import React, { ReactNode } from "react";

interface GridProps {
  children: ReactNode;
  columns: number;
}

export function Grid({ children, columns }: GridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 200px)`,
        columnGap: 1,
        gridGap: 10,
      }}
    >
      {children}
    </div>
  );
}
