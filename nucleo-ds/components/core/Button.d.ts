import * as React from 'react';

/**
 * Núcleo primary action button. Sentence-case, verb-led labels.
 *
 * @startingPoint section="Core" subtitle="Primary / secondary / ghost / danger button" viewport="700x160"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Icon node rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Icon node rendered after the label. */
  rightIcon?: React.ReactNode;
  /** Stretch to fill the container width. @default false */
  fullWidth?: boolean;
  /** Show a spinner and block interaction. @default false */
  loading?: boolean;
}

export function Button(props: ButtonProps): React.ReactElement;
