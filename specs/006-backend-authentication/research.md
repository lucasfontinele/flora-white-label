# Research: Autenticação Backend

## Decision: Criar módulo `modules/auth` para login

**Rationale**: O login é um caso de uso transversal que usa `User`, hashing e
token, mas não pertence ao módulo `users` como CRUD ou contexto detalhado de
usuário. Um módulo `auth` mantém a rota `/auth/login`, schemas e use case
co-localizados sem mover a entidade `User`.

**Alternatives considered**:

- Colocar `AuthenticateUserUseCase` em `modules/users`: rejeitado porque mistura
  identidade de usuário com fluxo de autenticação e tende a atrair sessão,
  token e autorização para o módulo de usuários.
- Criar estrutura global fora de `modules`: rejeitado porque os módulos atuais
  já organizam application/infrastructure/presentation por domínio.

## Decision: Reusar `UserRepository.findByEmail`

**Rationale**: `UserRepository` já existe em
`modules/users/application/repositories/UserRepository.ts` e já tem
`findByEmail(email: Email)`. `PrismaUserRepository` implementa a busca usando
o valor normalizado do `Email` value object.

**Alternatives considered**:

- Criar `AuthRepository`: rejeitado porque duplicaria o acesso a `User`.
- Buscar usuário diretamente com Prisma no use case: rejeitado por violar a
  separação application/infrastructure.

## Decision: Verificar senha somente via `HashService.verify`

**Rationale**: `HashService` já é a porta de aplicação para hashing e
`Argon2HashService` já isola a dependência concreta. O use case deve passar
`user.passwordHash.value` e a senha informada para `verify`.

**Alternatives considered**:

- Importar Argon2 no use case: rejeitado porque a regra explícita da spec e o
  comentário do adapter existente proíbem vazamento da biblioteca para aplicação.
- Comparar strings ou re-hash manual: rejeitado por insegurança e por ignorar a
  porta existente.

## Decision: Criar `JwtService` e `JoseJwtService`

**Rationale**: Nenhum `JwtService`, `JoseJwtService`, `jwt` ou `jose` foi
encontrado em `packages/api/src` ou nas dependências do pacote. A spec exige que
o use case assine via abstração e que biblioteca concreta fique na
infraestrutura, então a feature precisa introduzir a porta e um adapter.

**Alternatives considered**:

- Retornar token falso ou opaco: rejeitado porque o contrato exige JWT.
- Assinar diretamente na rota ou use case: rejeitado por acoplar apresentação ou
  aplicação à biblioteca de token.
- Adiar token service para feature futura: rejeitado porque o token faz parte do
  response de sucesso obrigatório.

## Decision: Validar login com Zod na apresentação

**Rationale**: As rotas atuais de organizações e planos validam entrada HTTP
com schemas Zod em `presentation/http` usando `safeParse`, e expõem JSON schemas
para Fastify/Swagger. O login deve seguir esse padrão para manter erros 400
previsíveis e evitar validação de transporte dentro do use case.

**Alternatives considered**:

- Validar apenas dentro do use case: rejeitado porque o padrão atual mais novo
  move validação de payload HTTP para a borda de apresentação.
- Usar somente JSON schema do Fastify: rejeitado porque o projeto já usa Zod
  para parse/trim/tipos dos handlers.

## Decision: Usar `AuthenticationError` com mapeamento global 401

**Rationale**: Credenciais inválidas são erro de aplicação traduzido para HTTP
pela apresentação. O handler global já centraliza mapeamentos de
`NotFoundError`, `ConflictError` e erros de domínio; adicionar
`AuthenticationError` mantém o padrão e evita lógica duplicada em rotas futuras.

**Alternatives considered**:

- Retornar 401 diretamente no route handler: aceito como fallback, mas menos
  consistente com os erros de aplicação existentes.
- Usar `DomainError`: rejeitado porque autenticação inválida não é regra de
  domínio da entidade `User`.

## Decision: Não alterar frontend, cookies ou sessão

**Rationale**: A spec restringe a entrega ao backend e exige somente retorno de
token e contexto. Nenhuma rota Next.js, IronSession, cookie ou UI é necessária
para validar o endpoint.

**Alternatives considered**:

- Criar cookie HTTP-only no backend: rejeitado porque a spec diz que cookies e
  IronSession serão responsabilidade posterior do frontend.
- Adicionar `/me`, logout ou refresh token: rejeitado por escopo explícito.

## Decision: Tratar testes HTTP como cobertura focada se viável

**Rationale**: O repositório tem muitos testes unitários e de schemas, mas não
foi encontrado padrão existente de `buildApp().inject()` ou testes de rota. O
plano prioriza use case e schemas e adiciona teste HTTP apenas se puder ser
feito sem banco real e sem grande refatoração.

**Alternatives considered**:

- Exigir teste HTTP completo com banco: rejeitado por aumentar escopo e
  infraestrutura de teste não existente.
- Não testar a rota de forma alguma: rejeitado porque a feature altera contrato
  HTTP crítico; ao menos schemas e quickstart devem cobrir a borda.

## Decision: Sinalizar risco de e-mail duplicado por organização

**Rationale**: `schema.prisma` define `@@unique([organizationId, email])`, mas o
login recebe apenas e-mail e senha. Se a base permitir o mesmo e-mail em
organizações diferentes, `findByEmail` pode retornar um registro arbitrário.

**Alternatives considered**:

- Alterar schema imediatamente para e-mail global único: rejeitado nesta fase
  porque a spec não pediu migração e isso pode afetar dados existentes.
- Adicionar `organizationId` ao login: rejeitado porque contradiz o contrato da
  spec atual.
