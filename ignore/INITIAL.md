# 01 — Configuração do Projeto Monorepo

## Objetivo

Criar um monorepo para o sistema white label de associações cannábicas, contendo:

* Aplicação front-end
* API back-end
* Pacote compartilhado de tipagens
* Configuração base de TypeScript
* Estrutura preparada para múltiplos tenants/organizações

## Estrutura sugerida

```txt
cannabis-association-os/
├── packages/
│   ├── web/
│   └── api/
├── package.json
└── pnpm-workspace.yaml
```

## Gerenciador de pacotes

Utilizar:

```bash
pnpm
```

## Workspaces

```yaml
packages:
  - "packages/*"
```

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

### Back-end

Local:

```txt
packages/api
```

Tecnologias:

* Node.js
* TypeScript
* Fastify
* Prisma ORM
* PostgreSQL
* Stripe
* JWT/Auth
* Arquitetura em camadas

## Pacote compartilhado

Local:

```txt
packages/shared
```

Responsável por armazenar:

* DTOs
* Enums
* Tipos compartilhados
* Contratos de API
* Status de pedidos
* Status de associados
* Tipos de produto
* Tipos de documento

Exemplo:

```ts
export enum OrderStatus {
  Requested = "requested",
  UnderReview = "under_review",
  Approved = "approved",
  InSeparation = "in_separation",
  ReadyForPickup = "ready_for_pickup",
  Shipped = "shipped",
  Delivered = "delivered",
  Canceled = "canceled",
}
```

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

## Arquitetura do back-end

Estrutura sugerida:

```txt
src/
├── application/
│   └── use-cases/
├── domain/
│   └── entities/
├── communication/
│   ├── controllers/
│   ├── routes/
│   └── dtos/
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   ├── stripe/
│   └── storage/
├── exceptions/
│   ├── AppError.ts
│   ├── NotFound404.ts
│   ├── BadRequest400.ts
│   └── Unauthorized401.ts
└── server.ts
```

## Módulos iniciais do backend

* Auth
* Organizations
* Members
* Patients
* Guardians
* Orders
* Products
* Strains
* Inventory
* Documents
* Reports

## Regras importantes

O sistema deve ser multi-tenant desde o início.

Todas as entidades principais devem possuir:

```ts
organizationId
```

Isso garante que cada associação veja apenas seus próprios dados.

## White Label

Cada organização deve poder configurar:

* Nome da associação
* Logo
* Cor primária
* Domínio customizado
* Dados institucionais
* Textos exibidos no portal do paciente
