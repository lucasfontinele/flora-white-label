The central component of Núcleo — the 7-stage order lifecycle. Patients must instantly understand where their order is.

```jsx
<OrderTimeline current="Em separação" timestamps={{
  'Solicitado': '12 jun · 09:14',
  'Em análise': '12 jun · 14:02',
}} />
```

Stages are fixed: Solicitado → Em análise → Aprovado → Em separação → Pronto para retirada → Enviado → Entregue. Done stages get a green check, the current stage pulses with the accent ring, upcoming stages are muted. Pass `timestamps` keyed by stage label.
