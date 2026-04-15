/**
 * @fileoverview Reusable progress bar component with percentage display.
 * Supports animated shimmer effect for active states and customizable labels.
 * @module components/shared/ProgressBar
 */

import { ReactElement } from "react";

/**
 * Props for the ProgressBar component.
 * @interface ProgressBarProps
 */
interface ProgressBarProps {
  /** Current progress value */
  current: number;
  /** Total/maximum value */
  total: number;
  /** Whether the progress is actively running (shows animation) */
  isActive?: boolean;
  /** Label shown on the left side */
  activeLabel?: string;
  /** Label shown when complete */
  completeLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A reusable progress bar component with percentage display.
 * 
 * @example
 * ```tsx
 * <ProgressBar
 *   current={45}
 *   total={100}
 *   isActive={true}
 *   activeLabel="Importing 45 / 100"
 *   completeLabel="45 / 100 imported"
 * />
 * ```
 */
export function ProgressBar({
  current,
  total,
  isActive = false,
  activeLabel,
  completeLabel,
  className = "",
}: ProgressBarProps): ReactElement {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const label = isActive ? activeLabel : completeLabel;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        {label && (
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
        <span className="font-semibold text-gray-900 dark:text-white">
          {percentage}% complete
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300 relative"
          style={{ width: `${percentage}%` }}
        >
          {isActive && (
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
