import React, { forwardRef, CSSProperties } from "react";

interface CoverProps {
  url: string;
  index: number;
  faded?: boolean;
  style?: CSSProperties;
}

export const Cover = forwardRef<HTMLDivElement, CoverProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ url, index, faded, style, ...props }, ref) => {
    const inlineStyles: CSSProperties = {
      opacity: faded ? "0.2" : "1",
      transformOrigin: "0 0",
      minHeight: index === 0 ? 300 : 300,
      maxWidth: 200,
      gridRowStart: index === 0 ? "span" : undefined,
      gridColumnStart: index === 0 ? "span" : undefined,
      backgroundImage: `url("${url}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor: "grey",
      border: "1px solid #CCC",
      borderRadius: "10px",
      ...style,
    };

    return <div ref={ref} style={inlineStyles} {...props}></div>;
  },
);

Cover.displayName = "Cover";
