import React, { useState } from "react";
import { useFloating, offset, flip } from "@floating-ui/react-dom";
import { useTranslation } from "react-i18next";
import "../../shared/utils/i18n.util"; // Ensure you import your i18n configuration

const PopoverButton = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  // Use destructuring to obtain the reference and floating setters, among other values.
  const { x, y, refs, strategy, floatingStyles } = useFloating({
    placement: "right",
    middleware: [offset(8), flip()],
    strategy: "absolute",
  });
  const { t } = useTranslation();
  return (
    <div>
      {/* Apply the reference setter directly to the ref prop */}
      <button
        ref={refs.setReference}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-describedby="popover"
        className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-2 py-2 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
      >
        <i className="icon-[solar--add-square-bold-duotone] w-6 h-6 mr-2"></i>{" "}
        Mark as Wanted
      </button>
      {isVisible && (
        <div
          ref={refs.setFloating} // Apply the floating setter directly to the ref prop
          style={floatingStyles}
          className="text-sm bg-slate-400 p-2 rounded-md"
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default PopoverButton;
