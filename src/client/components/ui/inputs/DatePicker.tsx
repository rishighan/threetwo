import React, { useRef, useState, Dispatch, SetStateAction } from "react";
import { format } from "date-fns";
import FocusTrap from "focus-trap-react";
import { DayPicker } from "react-day-picker";
import { useFloating, offset, flip, autoUpdate } from "@floating-ui/react-dom";
import styles from "react-day-picker/dist/style.module.css";

interface DatePickerDialogProps {
  setter: Dispatch<SetStateAction<string>>;
  apiAction?: () => void;
  inputValue?: string;
}

export const DatePickerDialog = (props: DatePickerDialogProps) => {
  const { setter, apiAction } = props;
  const [selected, setSelected] = useState<Date>();
  const [isPopperOpen, setIsPopperOpen] = useState(false);

  // Use styles without casting - let TypeScript infer
  const classNames = styles as unknown as Record<string, string>;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { refs, floatingStyles, strategy, update } = useFloating({
    placement: "bottom-end",
    middleware: [offset(10), flip()],
    strategy: "absolute",
  });

  const closePopper = () => {
    setIsPopperOpen(false);
    buttonRef.current?.focus();
  };

  const handleButtonClick = () => {
    setIsPopperOpen(true);
    if (refs.reference.current && refs.floating.current) {
      autoUpdate(refs.reference.current, refs.floating.current, update);
    }
  };

  const handleDaySelect = (date: Date | undefined) => {
    setSelected(date);
    if (date) {
      setter(format(date, "yyyy/MM/dd"));
      apiAction?.();
      closePopper();
    } else {
      setter("");
    }
  };

  return (
    <div>
      <div ref={refs.setReference}>
        <button
          ref={buttonRef}
          type="button"
          aria-label="Pick a date"
          onClick={handleButtonClick}
          className="flex space-x-1 mb-2 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-2 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
        >
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
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              zIndex: 999,
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Example of adding a shadow
            }}
            className="bg-slate-400 dark:bg-slate-500"
            role="dialog"
            aria-label="DayPicker calendar"
          >
            <DayPicker
              initialFocus={isPopperOpen}
              mode="single"
              defaultMonth={selected}
              selected={selected}
              onSelect={handleDaySelect}
              classNames={classNames}
            />
          </div>
        </FocusTrap>
      )}
    </div>
  );
};

export default DatePickerDialog;
