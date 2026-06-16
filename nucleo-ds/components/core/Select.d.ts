import * as React from 'react';

export interface SelectOption { value: string; label: string; }

/** Native select styled to match Núcleo inputs. */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  /** Options as strings or {value,label}. Ignored if children are passed. */
  options?: Array<string | SelectOption>;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: React.CSSProperties;
}

export function Select(props: SelectProps): React.ReactElement;
