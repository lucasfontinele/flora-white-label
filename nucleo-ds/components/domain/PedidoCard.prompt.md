Patient-facing order summary card: number, status, date, item count, delivery type.

```jsx
<PedidoCard numero="#PED-20482" status="Em separação" data="15 jun 2026"
  itens={3} tipoEntrega="Retirada na sede" onClick={abrir} />
```

Status drives the badge tone automatically (via the shared order vocabulary). Delivery icon switches between store (retirada) and truck (envio). Add `onClick` to make it a hover-lift list item.
