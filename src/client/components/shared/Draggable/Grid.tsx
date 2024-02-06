import React from "react";

export function Grid({ children, columns }) {
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
