import React, { useEffect } from "react";
import BlazeSlider from "blaze-slider";

export const useBlazeSlider = (config) => {
  const sliderRef = React.useRef();
  const elRef = React.useRef();

  useEffect(() => {
    // if not already initialized
    if (!sliderRef.current) {
      sliderRef.current = new BlazeSlider(elRef.current, config);
    }
  }, []);

  return elRef;
};
