import * as React from 'react';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Optional count pill (e.g. number of pending orders). */
  count?: number;
}

/** Horizontal tab bar. Controlled (`value`+`onChange`) or uncontrolled (`defaultValue`). */
export interface TabsProps {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

export function Tabs(props: TabsProps): React.ReactElement;
