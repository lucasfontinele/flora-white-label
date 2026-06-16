Text input with label, hint/error and optional icons.

```jsx
<Input label="CPF" placeholder="000.000.000-00" hint="Apenas números" />
<Input label="Buscar" leadingIcon={<Icon name="search" size={18} />} />
<Input label="E-mail" error="E-mail inválido" />
```

Sizes `sm | md | lg`. Focus shows the accent-green ring. `error` turns the border red and replaces `hint`.
