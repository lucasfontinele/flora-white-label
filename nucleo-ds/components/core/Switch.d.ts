import * as React from 'react';

/** Toggle switch for settings and on/off preferences. Controlled or uncontrolled. */
export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Optional trailing label. */
  label?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
}

export function Switch(props: SwitchProps): React.ReactElement;
