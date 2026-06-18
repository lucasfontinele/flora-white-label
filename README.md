# FloraApp

Plataforma white-label para gestão de associações de cannabis medicinal. O projeto está organizado como um monorepo pnpm com um front-end em Next.js e uma API em Fastify preparada para evoluir com Prisma e PostgreSQL.

No estado atual, o front-end já apresenta fluxos navegáveis para associado e operação usando dados mockados em `packages/web/lib/data.ts`. A API possui estrutura base, tratamento centralizado de erros, configuração de ambiente e endpoints técnicos de saúde/prontidão.

## Prints

### Login

![Tela de login](docs/screenshots/login.jpg)

### Cadastro

![Tela de cadastro](docs/screenshots/cadastro.jpg)

### Portal do associado

![Dashboard do associado](docs/screenshots/associado-dashboard.jpg)

### Operação da associação

![Dashboard operacional](docs/screenshots/operacional-dashboard.jpg)

## Stack

### Monorepo

- pnpm workspaces
- TypeScript
- Scripts centralizados na raiz

### Front-end

- Next.js 16
- React 19
- Tailwind CSS
- React Query
- React Hook Form
- Zod
- Zustand
- Radix Slot
- Lucide React

### Back-end

- Node.js com módulos ESM
- Fastify
- Prisma Client
- PostgreSQL
- dotenv

## Estrutura

```txt
.
├── packages
│   ├── api
│   │   ├── prisma
│   │   │   └── schema.prisma
│   │   └── src
│   │       ├── communication/http
│   │       ├── exception
│   │       └── infrastructure
│   ├── web
│   │   ├── app
│   │   ├── components
│   │   ├── lib
│   │   └── public
│   └── shared
│       └── futuro pacote de DTOs, enums, contratos de API e tipos TypeScript
├── docs
│   └── screenshots
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

## Requisitos

- Node.js `>=20.9.0`
- pnpm `10.14.0`
- PostgreSQL para usar o endpoint `/ready` da API com banco real

Versões usadas na criação deste README:

```txt
Node.js v22.18.0
pnpm 10.14.0
```

## Instalação

Instale as dependências na raiz:

```bash
pnpm install
```

O install cria `node_modules` na raiz e nos packages. Essas pastas são necessárias para desenvolvimento local, mas estão ignoradas pelo Git.

Se o pnpm bloquear scripts do Prisma, aprove os builds necessários:

```bash
pnpm approve-builds
```

## Variáveis de ambiente

A API possui um exemplo em `packages/api/.env.example`:

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3333
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL="postgresql://flora:flora@localhost:5432/flora?schema=public"
```

Crie o arquivo local:

```bash
cp packages/api/.env.example packages/api/.env
```

O arquivo `.env` não deve ser versionado.

Chaves usadas pela API:

| Chave | Descrição |
| --- | --- |
| `NODE_ENV` | Ambiente de execução: `development`, `test` ou `production`. |
| `HOST` | Interface usada pelo Fastify. Em desenvolvimento, use `0.0.0.0`. |
| `PORT` | Porta HTTP da API. O padrão local é `3333`. |
| `CORS_ORIGINS` | Lista separada por vírgula das origens web permitidas. |
| `DATABASE_URL` | URL PostgreSQL usada pelo Prisma. |

## Rodando o projeto

Rodar front-end e API em paralelo:

```bash
pnpm dev
```

Rodar apenas o front-end:

```bash
pnpm dev:web
```

URL padrão:

```txt
http://localhost:3000
```

Rodar apenas a API:

```bash
pnpm dev:api
```

URL padrão:

```txt
http://localhost:3333
```

Swagger UI da API:

```txt
http://localhost:3333/docs
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Executa todos os apps em modo desenvolvimento |
| `pnpm dev:web` | Executa apenas o Next.js |
| `pnpm dev:api` | Executa apenas a API Fastify |
| `pnpm build` | Gera build de todos os packages |
| `pnpm build:web` | Gera build do front-end |
| `pnpm build:api` | Compila a API TypeScript para `dist` |
| `pnpm typecheck` | Executa typecheck em todos os packages |
| `pnpm typecheck:web` | Executa typecheck do front-end |
| `pnpm typecheck:api` | Executa typecheck da API |
| `pnpm prisma:generate` | Gera o Prisma Client da API |
| `pnpm prisma:migrate` | Executa migrations de desenvolvimento da API |

## Rotas do front-end

### Autenticação

| Rota | Descrição |
| --- | --- |
| `/` | Redireciona para `/entrar` |
| `/entrar` | Tela de login com entrada para associado ou operação |
| `/cadastro` | Cadastro em etapas com validação, rascunho local e busca de CEP |

### Portal do associado

| Rota | Descrição |
| --- | --- |
| `/dashboard` | Resumo do paciente ativo, documentos e pedido em andamento |
| `/orders` | Histórico e acompanhamento de pedidos |
| `/catalog` | Catálogo educativo com filtros por categoria |
| `/documents` | Documentos do associado/paciente |
| `/profile` | Dados de perfil e paciente gerenciado |

### Operação da associação

| Rota | Descrição |
| --- | --- |
| `/operacional` | Redireciona para `/operacional/dashboard` |
| `/operacional/dashboard` | Indicadores, status de pedidos e estoque baixo |
| `/operacional/orders` | Fila operacional de pedidos |
| `/operacional/orders/[orderId]` | Detalhe operacional de um pedido |
| `/operacional/members` | Associados, responsáveis e pacientes |
| `/operacional/products` | Produtos, lotes e disponibilidade |
| `/operacional/strains` | Strains exibidas no catálogo educativo |
| `/operacional/inventory` | Estoque, saldos e alertas |
| `/operacional/reports` | Relatórios e indicadores |
| `/operacional/access` | Perfis e permissões de acesso |

## API

A API é criada em `packages/api/src/communication/http/build-server.ts` e registra hoje as rotas técnicas:

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Retorna `{ "status": "ok" }` |
| `GET` | `/ready` | Valida conexão com o banco via Prisma e retorna prontidão |

Exemplo:

```bash
curl http://localhost:3333/health
curl http://localhost:3333/ready
```

O handler global de erros fica em `packages/api/src/communication/http/plugins/error-handler.ts` e padroniza respostas no formato:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Erro interno do servidor."
  }
}
```

## Banco de dados

O Prisma está configurado em `packages/api/prisma/schema.prisma` com provider PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

O schema possui as tabelas de organizações, endereços e planos de assinatura. O endpoint `/ready` usa o Prisma para executar `SELECT 1`, então ele depende de `DATABASE_URL` válido e banco acessível.

Para subir o PostgreSQL local pelo Docker Compose:

```bash
docker compose up -d postgres
pnpm prisma:generate
pnpm prisma:migrate
```

O Compose cria o banco `flora` com usuário `flora` e senha `flora`, compatível com o `DATABASE_URL` de `packages/api/.env.example`.

## Arquitetura do front-end

O App Router está separado em grupos de rota:

```txt
app/
├── (auth)/
├── (associated)/
└── (organization)/
```

As features seguem um padrão próximo de:

```txt
feature/
├── page.tsx
├── components/
├── requests/
├── queries/
├── schemas/
└── types.ts
```

Pontos importantes:

- `components/layout` concentra o shell responsivo e navegação.
- `components/ui` concentra componentes base de interface.
- `components/domain` concentra componentes reutilizáveis do domínio.
- `lib/data.ts` contém dados mockados usados pelas telas atuais.
- `app/providers.tsx` configura o `QueryClientProvider`.
- `app/globals.css` define tokens de design, cores, tipografia, espaçamentos e raios.

## Arquitetura da API

```txt
src/
├── communication/http
│   ├── plugins
│   └── routes
├── exception
├── infrastructure
│   ├── config
│   └── database
├── application
└── domain
```

Responsabilidades atuais:

- `main.ts`: bootstrap, listen e shutdown gracioso.
- `build-server.ts`: criação do Fastify, logger, plugins e rotas.
- `env.ts`: leitura e validação básica de ambiente.
- `prisma-client.ts`: instância compartilhada do Prisma Client.
- `exception`: exceções de aplicação com status HTTP e código padronizado.

## Contratos compartilhados

O monorepo está preparado para receber `packages/shared`, pacote responsável por
DTOs, enums, contratos de API e tipos TypeScript usados por mais de uma
aplicação. Até esse pacote existir, mudanças de contrato devem ser documentadas
nos artefatos da feature e mantidas consistentes entre `packages/web` e
`packages/api`.

## Qualidade e verificação

Antes de abrir PR ou enviar alterações, rode:

```bash
pnpm typecheck
pnpm build
```

Para validar o front-end isoladamente:

```bash
pnpm typecheck:web
pnpm build:web
```

Para validar a API isoladamente:

```bash
pnpm typecheck:api
pnpm build:api
```

## Arquivos ignorados

O projeto possui `.gitignore` na raiz e também nos packages para evitar envio de arquivos gerados ou locais:

- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `coverage/`
- `*.tsbuildinfo`
- `.env*`, exceto exemplos
- logs, caches, arquivos temporários e arquivos locais de editor

Se algum arquivo ignorado já tiver sido versionado antes, remova-o do índice:

```bash
git rm -r --cached node_modules packages/web/node_modules packages/api/node_modules
git rm -r --cached packages/web/.next packages/api/dist
```

## Estado atual

- Front-end navegável com telas de autenticação, cadastro, portal do associado e operação.
- Dados do front-end ainda mockados em memória.
- API com base técnica pronta, mas sem rotas de negócio implementadas.
- Prisma configurado para PostgreSQL, ainda sem models de domínio.
- Screenshots do README gerados a partir do app local em `http://localhost:3000`.
