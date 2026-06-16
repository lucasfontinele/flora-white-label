Executive metric card for dashboards (Diretoria). Big number, optional delta + context.

```jsx
<StatCard label="Pedidos no mês" value="142" icon="package" delta="+12%" hint="vs. maio" />
<StatCard label="Estoque baixo" value="3" icon="alert-triangle" delta="−2" deltaTone="error" />
```

`icon` accepts a Lucide name or a node. `deltaTone`: success (up, green), error (down, red), neutral. Keep labels short and factual.
