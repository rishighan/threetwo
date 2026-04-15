/**
 * @fileoverview Reusable stats card component for displaying numeric metrics.
 * Used for dashboards and import statistics displays.
 * @module components/shared/StatsCard
 */

import { ReactElement } from "react";

/**
 * Props for the StatsCard component.
 * @interface StatsCardProps
 */
interface StatsCardProps {
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
}

/**
 * A reusable stats card component for displaying numeric metrics.
 * 
 * @example
 * ```tsx
 * <StatsCard 
 *   value={42} 
 *   label="imported in database" 
 *   backgroundColor="#d8dab2"
 *   valueColor="text-gray-800"
 * />
 * ```
 */
export function StatsCard({
  value,
  label,
  backgroundColor = "#6b7280",
  valueColor = "text-white",
  labelColor = "text-gray-200",
  className = "",
}: StatsCardProps): ReactElement {
  const isHexColor = backgroundColor.startsWith("#") || backgroundColor.startsWith("rgb");
  
  return (
    <div
      className={`rounded-lg p-6 text-center ${!isHexColor ? backgroundColor : ""} ${className}`}
      style={isHexColor ? { backgroundColor } : undefined}
    >
      <div className={`text-4xl font-bold ${valueColor} mb-2`}>{value}</div>
      <div className={`text-sm ${labelColor} font-medium`}>{label}</div>
    </div>
  );
}

export default StatsCard;
