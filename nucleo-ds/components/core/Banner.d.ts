import * as React from 'react';

/** Inline banner / alert with optional title, icon and close button. */
export interface BannerProps {
  /** @default "info" */
  tone?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  title?: React.ReactNode;
  /** Leading icon node, e.g. <Icon name="shield-check" />. */
  icon?: React.ReactNode;
  /** When provided, shows a close button. */
  onClose?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Banner(props: BannerProps): React.ReactElement;
