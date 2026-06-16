import * as React from 'react';

/** Small status pill. Add a dot for live order/document states. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "neutral" */
  tone?: 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'petrol';
  /** Show a leading status dot. @default false */
  dot?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
}

export function Badge(props: BadgeProps): React.ReactElement;
