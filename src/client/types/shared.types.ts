/**
 * @fileoverview Centralized type definitions for shared UI components.
 * @module types/shared.types
 */

import type { ReactNode, ReactElement } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";

/**
 * Visual style variants for alert components.
 */
export type AlertVariant = "error" | "warning" | "info" | "success";

/**
 * Props for AlertCard component.
 */
export type AlertCardProps = {
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
};

/**
 * Props for Card component.
 */
export type CardProps = {
  orientation: string;
  imageUrl?: string;
  hasDetails?: boolean;
  title?: string;
  children?: ReactNode;
};

/**
 * Props for ProgressBar component.
 */
export type ProgressBarProps = {
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
};

/**
 * Props for StatsCard component.
 */
export type StatsCardProps = {
  /** The main numeric value to display */
  value: number;
  /** Label text below the value */
  label: string;
  /** Background color (CSS color string or Tailwind class) */
  backgroundColor?: string;
  /** Text color for the value (defaults to white) */
  valueColor?: string;
  /** Text color for the label (defaults to slightly transparent) */
  labelColor?: string;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Props for T2Table component.
 */
export type T2TableProps<TData> = {
  /** Row data to render. */
  sourceData?: TData[];
  /** Total number of records across all pages, used for pagination display. */
  totalPages?: number;
  /** Column definitions (TanStack Table ColumnDef array). */
  columns?: ColumnDef<TData>[];
  /** Callbacks for navigating between pages. */
  paginationHandlers?: {
    nextPage?(pageIndex: number, pageSize: number): void;
    previousPage?(pageIndex: number, pageSize: number): void;
  };
  /** Called with the TanStack row object when a row is clicked. */
  rowClickHandler?(row: Row<TData>): void;
  /** Returns additional CSS classes for a given row (e.g. for highlight states). */
  getRowClassName?(row: Row<TData>): string;
  /** Optional slot rendered in the toolbar area (e.g. a search input). */
  children?: ReactNode;
};

/**
 * Props for MetadataPanel component.
 */
export type MetadataPanelProps = {
  data: any;
  isMissing?: boolean;
};

/**
 * Props for Header component.
 */
export type HeaderProps = {
  headerContent: string;
  subHeaderContent?: ReactNode;
  iconClassNames?: string;
  link?: string;
};

/**
 * Props for DatePicker component.
 */
export type DatePickerProps = {
  inputValue: string;
  setter: (value: string) => void;
};

/**
 * Props for PopoverButton component.
 */
export type PopoverButtonProps = {
  content: string;
  clickHandler: () => void;
};

/**
 * Props for TabulatedContentContainer component.
 */
export type TabulatedContentContainerProps = {
  category: string;
};

/**
 * Props for Downloads component.
 */
export type DownloadsProps = {
  data: any;
};

/**
 * Props for LibraryGrid component.
 */
export type LibraryGridProps = Record<string, never>;

/**
 * Props for Settings component.
 */
export type SettingsProps = Record<string, never>;
