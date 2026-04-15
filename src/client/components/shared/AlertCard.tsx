/**
 * @fileoverview Reusable alert card component for displaying status messages.
 * Supports multiple variants (error, warning, info, success) with consistent
 * styling and optional dismiss functionality.
 * @module components/shared/AlertCard
 */

import { ReactElement, ReactNode } from "react";

/**
 * Visual style variants for the alert card.
 * @typedef {"error"|"warning"|"info"|"success"} AlertVariant
 */
export type AlertVariant = "error" | "warning" | "info" | "success";

interface AlertCardProps {
  /** The visual style variant of the alert */
  variant: AlertVariant;
  /** Optional title displayed prominently */
  title?: string;
  /** Main message content */
  children: ReactNode;
  /** Optional callback when dismiss button is clicked */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const variantStyles: Record<AlertVariant, {
  container: string;
  border: string;
  icon: string;
  iconClass: string;
  title: string;
  text: string;
}> = {
  error: {
    container: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-500",
    icon: "text-red-600 dark:text-red-400",
    iconClass: "icon-[solar--danger-circle-bold]",
    title: "text-red-800 dark:text-red-300",
    text: "text-red-700 dark:text-red-400",
  },
  warning: {
    container: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-300",
    icon: "text-amber-600 dark:text-amber-400",
    iconClass: "icon-[solar--danger-triangle-bold]",
    title: "text-amber-800 dark:text-amber-300",
    text: "text-amber-700 dark:text-amber-400",
  },
  info: {
    container: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-500",
    icon: "text-blue-600 dark:text-blue-400",
    iconClass: "icon-[solar--info-circle-bold]",
    title: "text-blue-800 dark:text-blue-300",
    text: "text-blue-700 dark:text-blue-400",
  },
  success: {
    container: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-500",
    icon: "text-green-600 dark:text-green-400",
    iconClass: "icon-[solar--check-circle-bold]",
    title: "text-green-800 dark:text-green-300",
    text: "text-green-700 dark:text-green-400",
  },
};

/**
 * A reusable alert card component for displaying messages with consistent styling.
 * 
 * @example
 * ```tsx
 * <AlertCard variant="error" title="Import Error" onDismiss={() => setError(null)}>
 *   {errorMessage}
 * </AlertCard>
 * ```
 */
export function AlertCard({
  variant,
  title,
  children,
  onDismiss,
  className = "",
}: AlertCardProps): ReactElement {
  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-lg border-l-4 ${styles.border} ${styles.container} p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className={`w-6 h-6 ${styles.icon} mt-0.5 shrink-0`}>
          <i className={`h-6 w-6 ${styles.iconClass}`}></i>
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`font-semibold ${styles.title}`}>{title}</p>
          )}
          <div className={`text-sm ${styles.text} ${title ? "mt-1" : ""}`}>
            {children}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${styles.icon} hover:opacity-70 transition-opacity`}
          >
            <i className="h-5 w-5 icon-[solar--close-circle-bold]"></i>
          </button>
        )}
      </div>
    </div>
  );
}

export default AlertCard;
