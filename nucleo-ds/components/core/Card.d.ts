import * as React from 'react';

/**
 * Card surface — white, soft radius, hairline + discreet shadow. Núcleo's default container.
 *
 * @startingPoint section="Core" subtitle="White surface container with optional hover lift" viewport="700x220"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** CSS padding value. @default "var(--space-5)" */
  padding?: string;
  /** Adds hover lift + pointer cursor. @default false */
  interactive?: boolean;
  /** Resting shadow one step up. @default false */
  elevated?: boolean;
}

export function Card(props: CardProps): React.ReactElement;
