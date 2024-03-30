import React, { ChangeEventHandler, useRef, useState } from "react";

import { format, isValid, parse, parseISO } from "date-fns";
import FocusTrap from "focus-trap-react";
import { DayPicker, SelectSingleEventHandler } from "react-day-picker";
import { usePopper } from "react-popper";

export const DatePickerDialog = (props) => {
  const { setter, apiAction } = props;
  const [selected, setSelected] = useState<Date>();
  const [isPopperOpen, setIsPopperOpen] = useState(false);

  const popperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );

  const customStyles = {
    container: {
      // Style for the entire container
      border: "1px solid #ccc",
      borderRadius: "4px",
      padding: "10px",
      width: "300px",
    },
    day: {
      // Style for individual days

      padding: "5px",
      margin: "2px",
    },
    selected: {
      // Style for selected days
      backgroundColor: "#007bff",
      color: "#fff",
    },
    disabled: {
      // Style for disabled days
      color: "#ccc",
    },
    today: {
      // Style for today's date
      backgroundColor: "#f0f0f0",
    },
    dayWrapper: {
      // Style for the wrapper around each day
      display: "inline-block",
    },
  };

  const popper = usePopper(popperRef.current, popperElement, {
    placement: "bottom-start",
  });

  const closePopper = () => {
    setIsPopperOpen(false);
    buttonRef?.current?.focus();
  };

  const handleButtonClick = () => {
    setIsPopperOpen(true);
  };

  const handleDaySelect: SelectSingleEventHandler = (date) => {
    setSelected(date);
    if (date) {
      setter(format(date, "M-dd-yyyy"));
      apiAction();
      closePopper();
    } else {
      setter("");
    }
  };

  return (
    <div>
      <div ref={popperRef}>
        <button
          ref={buttonRef}
          type="button"
          aria-label="Pick a date"
          onClick={handleButtonClick}
          className="flex space-x-1 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-2 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
        >
          <span className="pr-1 pt-0.5 h-8">
            <span className="icon-[solar--calendar-date-bold-duotone] w-6 h-6"></span>
          </span>
          Pick a date
        </button>
      </div>
      {isPopperOpen && (
        <FocusTrap
          active
          focusTrapOptions={{
            initialFocus: false,
            allowOutsideClick: true,
            clickOutsideDeactivates: true,
            onDeactivate: closePopper,
            fallbackFocus: buttonRef.current || undefined,
          }}
        >
          <div
            tabIndex={-1}
            style={popper.styles.popper}
            className="bg-slate-200 mt-3 p-2 rounded-lg z-50"
            {...popper.attributes.popper}
            ref={setPopperElement}
            role="dialog"
            aria-label="DayPicker calendar"
          >
            <DayPicker
              initialFocus={isPopperOpen}
              mode="single"
              defaultMonth={selected}
              selected={selected}
              onSelect={handleDaySelect}
              styles={customStyles}
            />
          </div>
        </FocusTrap>
      )}
    </div>
  );
};

export default DatePickerDialog;
