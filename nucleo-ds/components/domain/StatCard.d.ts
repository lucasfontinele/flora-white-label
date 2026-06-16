import * as React from 'react';

/** Executive metric card for dashboards (Diretoria). */
export interface StatCardProps {
  label: string;
  value: string | number;
  /** Trailing unit, e.g. "pedidos", "%". */
  unit?: string;
  /** Lucide icon name or a node. */
  icon?: string | React.ReactNode;
  /** Change indicator text, e.g. "+12%". */
  delta?: string;
  /** @default "success" */
  deltaTone?: 'success' | 'error' | 'neutral';
  /** Muted context after the delta, e.g. "vs. mês anterior". */
  hint?: string;
  style?: React.CSSProperties;
}

export function StatCard(props: StatCardProps): React.ReactElement;
