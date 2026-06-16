## Aplicações

### Front-end

Local:

```txt
packages/web
```

Tecnologias:

* TypeScript
* Next.js
* Tailwind CSS
* Shadcn UI
* React Query
* React Hook Form
* Zod ou Yup para validação
* Axios ou Fetch wrapper

## Arquitetura do front-end

A aplicação deve ser separada em duas grandes áreas:

```txt
app/
├── (associated)/
│   ├── dashboard/
│   ├── orders/
│   ├── catalog/
│   ├── documents/
│   └── profile/
│
├── (organization)/
│   ├── dashboard/
│   ├── orders/
│   ├── members/
│   ├── products/
│   ├── strains/
│   ├── inventory/
│   └── reports/
```

As pastas entre parênteses não devem aparecer na URL.

Cada feature deve seguir a estrutura:

```txt
orders/
├── page.tsx
├── components/
├── requests/
├── queries/
├── schemas/
└── types.ts
```

## Padrão de queries

Cada feature pode ter seus próprios hooks de React Query.

Exemplo:

```ts
export function useOrdersQuery() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
}
```
