import * as React from 'react';

export interface DeliveryEvent {
  titulo: string;
  quando: string;
  local?: string;
}

/** Delivery tracking panel — status, ETA, tracking code, history. */
export interface DeliveryTrackingProps {
  status: string;
  ultimaAtualizacao: string;
  previsao: string;
  /** Tracking code (shown monospace). */
  codigo: string;
  /** Newest event first. */
  historico: DeliveryEvent[];
  style?: React.CSSProperties;
}

export function DeliveryTracking(props: DeliveryTrackingProps): React.ReactElement;
