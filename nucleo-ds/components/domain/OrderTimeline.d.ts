import * as React from 'react';

/**
 * Vertical order timeline — the central component of the system. Renders the
 * 7-stage lifecycle with done / current / upcoming states.
 *
 * @startingPoint section="Domain" subtitle="7-stage order lifecycle timeline" viewport="360x440"
 */
export interface OrderTimelineProps {
  /** Current stage label (must match a value in `stages`). */
  current: string;
  /** Optional map of stage label → timestamp string shown under the stage. */
  timestamps?: Record<string, string>;
  /** Override the stage list. Defaults to the standard 7 stages. */
  stages?: string[];
  style?: React.CSSProperties;
}

export function OrderTimeline(props: OrderTimelineProps): React.ReactElement;
