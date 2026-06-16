Primary action button — sentence-case, verb-led labels ("Fazer pedido", "Aprovar"). Use when the user commits an action.

```jsx
<Button variant="primary" onClick={fazerPedido}>Fazer pedido</Button>
<Button variant="secondary" leftIcon={<Icon name="file-text" />}>Ver documentos</Button>
<Button variant="ghost" size="sm">Cancelar</Button>
<Button variant="danger">Recusar pedido</Button>
```

Variants: `primary` (institutional green, tinted lift), `secondary` (white + border), `ghost` (text-only green), `danger` (error red). Sizes `sm | md | lg`. Props: `leftIcon`, `rightIcon`, `fullWidth`, `loading`, `disabled`. Min height 36/44/52px keeps touch targets accessible for patient screens.
