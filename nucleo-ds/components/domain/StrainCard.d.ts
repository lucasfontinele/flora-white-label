import * as React from 'react';

/**
 * Educational catalogue card for a product/strain. Cover + medicinal data.
 * Informational only — never therapeutic advice.
 *
 * @startingPoint section="Domain" subtitle="Catalogue strain card with THC/CBD/terpenes" viewport="320x400"
 */
export interface StrainCardProps {
  nome: string;
  /** Category badge, e.g. "Full spectrum", "Híbrida". */
  tipo?: string;
  /** Cover image URL. Falls back to a neutral placeholder. */
  imagem?: string;
  /** THC value string, e.g. "18%". */
  thc: string;
  /** CBD value string, e.g. "< 1%". */
  cbd: string;
  /** Terpene names. */
  terpenos?: string[];
  /** Indication tags, e.g. "Ansiedade", "Dor crônica". */
  tags?: string[];
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function StrainCard(props: StrainCardProps): React.ReactElement;
