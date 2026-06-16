import * as React from 'react';

/** Checkbox with optional label. Controlled or uncontrolled. */
export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
}

export function Checkbox(props: CheckboxProps): React.ReactElement;
