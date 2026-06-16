Delivery tracking panel — current status, last update, ETA, tracking code, history. Mercado Livre / iFood layout in the medical register.

```jsx
<DeliveryTracking status="Enviado" ultimaAtualizacao="há 2 horas" previsao="17 jun 2026"
  codigo="BR4821-9X7K" historico={[
    { titulo:'Pedido enviado', quando:'15 jun · 16:40', local:'Sede' },
    { titulo:'Pedido aprovado', quando:'13 jun · 10:30' },
  ]} />
```

`historico` is newest-first; the top event gets the live accent dot. Tracking code renders monospace.
