import React, { useEffect, useRef } from "react";

export const Canvas = ({ data }) => {
  const { colorHistogramData } = data;
  const width = 559;
  const height = 200;
  const pixelRatio = window.devicePixelRatio;

  const canvas = useRef(null);

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) {
      return;
    }

    context.scale(pixelRatio, pixelRatio);
    const guideHeight = 8;
    const startY = height - guideHeight;
    const dx = width / 256;
    const dy = startY / colorHistogramData.maxBrightness;
    context.lineWidth = dx;
    context.fillStyle = "transparent";
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < 256; i++) {
      const x = i * dx;

      // Red
      context.strokeStyle = "rgba(220,0,0,0.5)";
      context.beginPath();
      context.moveTo(x, startY);
      context.lineTo(x, startY - colorHistogramData.r[i] / 10);
      context.closePath();
      context.stroke();
      // Green
      context.strokeStyle = "rgba(0,210,0,0.5)";
      context.beginPath();
      context.moveTo(x, startY);
      context.lineTo(x, startY - colorHistogramData.g[i] / 10);
      context.closePath();
      context.stroke();
      // Blue
      context.strokeStyle = "rgba(0,0,255,0.5)";
      context.beginPath();
      context.moveTo(x, startY);
      context.lineTo(x, startY - colorHistogramData.b[i] / 10);
      context.closePath();
      context.stroke();

      // Guide
      context.strokeStyle = `rgb(${i}, ${i}, ${i})`;
      context.beginPath();
      context.moveTo(x, startY);
      context.lineTo(x, height);
      context.closePath();
      context.stroke();
    }

    // Cleanup function
    return () => {
      // Perform cleanup actions here
    };
  }, [colorHistogramData, pixelRatio]);

  const dw = Math.floor(pixelRatio * width);
  const dh = Math.floor(pixelRatio * height);
  const style = { width, height };

  return <canvas ref={canvas} width={dw} height={dh} style={style} />;
};

export default Canvas;
