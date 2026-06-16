import * as React from 'react';

/** User/patient avatar — image when `src` is set, otherwise initials from `name`. */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name?: string;
  src?: string;
  /** Pixel diameter. @default 40 */
  size?: number;
  /** @default "primary" */
  tone?: 'primary' | 'petrol' | 'neutral';
}

export function Avatar(props: AvatarProps): React.ReactElement;
