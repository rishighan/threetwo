/**
 * @fileoverview Reusable alert banner component for displaying status messages.
 * @module components/shared/AlertBanner
 */

import { ReactElement, ReactNode } from "react";

/**
 * Alert severity levels that determine styling.
 */
export type AlertSeverity = "error" | "warning" | "info" | "success";

/**
 * Props for the AlertBanner component.
 */
export type AlertBannerProps = {
  /** Alert severity level */
  severity: AlertSeverity;
  /** Alert title/heading */
  title: string;
  /** Alert content - can be string or JSX */
  children: ReactNode;
  /** Optional close handler - shows close button when provided */
  onClose?: () => void;
  /** Optional custom icon class (defaults based on severity) */
  iconClass?: string;
  /** Optional additional CSS classes */
  className?: string;
};

const severityConfig: Record<
  AlertSeverity,
  {
    border: string;
    bg: string;
    titleColor: string;
    textColor: string;
    iconColor: string;
    defaultIcon: string;
  }
> = {
  error: {
    border: "border-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    titleColor: "text-red-800 dark:text-red-300",
    textColor: "text-red-700 dark:text-red-400",
    iconColor: "text-red-600 dark:text-red-400",
    defaultIcon: "icon-[solar--danger-circle-bold]",
  },
  warning: {
    border: "border-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    titleColor: "text-amber-800 dark:text-amber-300",
    textColor: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
    defaultIcon: "icon-[solar--folder-error-bold]",
  },
  info: {
    border: "border-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    titleColor: "text-blue-800 dark:text-blue-300",
    textColor: "text-blue-700 dark:text-blue-400",
    iconColor: "text-blue-600 dark:text-blue-400",
    defaultIcon: "icon-[solar--info-circle-bold]",
  },
  success: {
    border: "border-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    titleColor: "text-emerald-800 dark:text-emerald-300",
    textColor: "text-emerald-700 dark:text-emerald-400",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    defaultIcon: "icon-[solar--check-circle-bold]",
  },
};

/**
 * Reusable alert banner component for displaying status messages.
 *
 * @param props - Component props
 * @returns Alert banner element
 *
 * @example
 * ```tsx
 * <AlertBanner severity="error" title="Import Error" onClose={() => setError(null)}>
 *   Failed to import files. Please try again.
 * </AlertBanner>
 * ```
 */
export const AlertBanner = ({
  severity,
  title,
  children,
  onClose,
  iconClass,
  className = "",
}: AlertBannerProps): ReactElement => {
  const config = severityConfig[severity];
  const icon = iconClass || config.defaultIcon;

  return (
    <div
      className={`rounded-lg border-s-4 ${config.border} ${config.bg} p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className={`w-6 h-6 ${config.iconColor} mt-0.5`}>
          <i className={`h-6 w-6 ${icon}`}></i>
        </span>
        <div className="flex-1">
          <p className={`font-semibold ${config.titleColor}`}>{title}</p>
          <div className={`text-sm ${config.textColor} mt-1`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${config.iconColor} hover:opacity-70`}
            aria-label="Close alert"
          >
            <span className="w-5 h-5">
              <i className="h-5 w-5 icon-[solar--close-circle-bold]"></i>
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;
