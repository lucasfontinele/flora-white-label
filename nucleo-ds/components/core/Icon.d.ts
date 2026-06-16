import * as React from 'react';

/** Outline icon wrapper over Lucide. Requires the Lucide UMD script on the page. */
export interface IconProps {
  /** Lucide icon name, kebab-case (e.g. "package", "truck", "shield-check"). */
  name: string;
  /** Pixel size (width = height). @default 20 */
  size?: number;
  /** Stroke width. @default 1.75 */
  strokeWidth?: number;
  /** Stroke color. @default "currentColor" */
  color?: string;
  style?: React.CSSProperties;
}

export function Icon(props: IconProps): React.ReactElement;
