Default Núcleo container: white surface, soft 16px radius, hairline border + discreet shadow.

```jsx
<Card>…</Card>
<Card interactive onClick={open}>…</Card>   // hover lift, for clickable list items
<Card elevated padding="var(--space-6)">…</Card>
```

Props: `padding`, `interactive` (hover lift + pointer), `elevated` (one step up at rest). Never stack a heavy shadow AND a strong border — pick one.
