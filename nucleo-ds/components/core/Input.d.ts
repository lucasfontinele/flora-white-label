import * as React from 'react';

/** Text input with label, hint/error and optional leading/trailing icons. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  /** Helper text shown below when there is no error. */
  hint?: string;
  /** Error message; turns the field red and replaces the hint. */
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: React.CSSProperties;
}

export function Input(props: InputProps): React.ReactElement;
