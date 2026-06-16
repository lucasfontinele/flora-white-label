# 02 — Domínio e Linguagem Ubíqua

## Objetivo

Definir a linguagem principal do domínio para orientar o desenvolvimento do back-end, banco de dados, contratos de API e comunicação entre produto, negócio e engenharia.

## Contexto do produto

O sistema é uma plataforma white label para associações cannábicas brasileiras.

Ele deve permitir que uma organização gerencie:

* Associados
* Pacientes
* Tutores/responsáveis
* Documentos médicos
* Catálogo de produtos
* Strains
* Estoque
* Lotes
* Pedidos
* Entregas
* Relatórios operacionais

## Entidades principais

## Organization

Representa a associação contratante do sistema.

Campos principais:

* id
* name
* tradeName
* document
* logoUrl
* primaryColor
* domain
* status

## Member

Representa o associado cadastrado na associação.

Um associado pode ser:

* O próprio paciente
* Um tutor/responsável por um ou mais pacientes

Campos principais:

* id
* organizationId
* name
* cpf
* email
* phone
* status

Status possíveis:

```ts
PendingReview
Active
Blocked
Inactive
```

## Patient

Representa a pessoa que recebe o tratamento.

Campos principais:

* id
* organizationId
* memberId
* name
* cpf
* birthDate
* medicalCondition
* status

## Guardian

Representa o responsável legal ou tutor.

Um tutor pode gerenciar múltiplos pacientes.

Campos principais:

* id
* organizationId
* memberId
* patientId
* relationshipType

Exemplos de vínculo:

```ts
Father
Mother
LegalGuardian
Caregiver
Other
```

## MedicalDocument

Representa documentos médicos enviados pelo associado.

Tipos:

```ts
MedicalPrescription
MedicalReport
PersonalDocument
ProofOfAddress
AssociationTerm
```

Status:

```ts
PendingReview
Approved
Rejected
Expired
```

Campos principais:

* id
* organizationId
* patientId
* type
* fileUrl
* expiresAt
* status
* reviewedBy

## Strain

Representa uma variedade/genética cannábica cadastrada pela organização.

Campos principais:

* id
* organizationId
* name
* type
* thcPercentage
* cbdPercentage
* dominantTerpenes
* aromas
* reportedEffects
* description
* imageUrl

Tipos:

```ts
Indica
Sativa
Hybrid
CBDDominant
Balanced
```

Tags informativas:

* Sono
* Ansiedade
* Dor
* Relaxamento
* Foco
* Apetite

Importante: o sistema deve apresentar essas informações como conteúdo educativo, não como prescrição médica.

## Product

Representa um item disponível no catálogo.

Exemplos:

* Flor Purple Punch 10g
* Óleo CBD 30ml
* Extrato Full Spectrum
* Cápsulas CBD

Campos principais:

* id
* organizationId
* strainId
* name
* description
* productType
* imageUrl
* isAvailable

Tipos:

```ts
Flower
Oil
Extract
Capsule
Topical
Other
```

## InventoryBatch

Representa um lote de produto.

Campos principais:

* id
* organizationId
* productId
* batchCode
* quantityAvailable
* quantityInitial
* expirationDate
* productionDate
* status

Status:

```ts
Available
LowStock
Expired
Blocked
Finished
```

## InventoryMovement

Representa qualquer movimentação de estoque.

Tipos:

```ts
Entry
OrderReservation
OrderWithdrawal
Loss
Discard
Adjustment
```

Campos principais:

* id
* organizationId
* productId
* batchId
* quantity
* movementType
* reason
* createdBy

## Order

Representa uma solicitação feita por paciente ou tutor.

Campos principais:

* id
* organizationId
* patientId
* memberId
* status
* deliveryType
* totalItems
* createdAt

Status do pedido:

```ts
Requested
UnderReview
Approved
InSeparation
ReadyForPickup
Shipped
Delivered
Canceled
Rejected
```

## OrderItem

Representa um item dentro de um pedido.

Campos principais:

* id
* orderId
* productId
* batchId
* quantity

## Delivery

Representa as informações de entrega ou retirada.

Tipos:

```ts
Pickup
Delivery
```

Campos principais:

* id
* orderId
* deliveryType
* address
* trackingCode
* carrierName
* estimatedDeliveryDate
* deliveredAt

## Linguagem ubíqua

### Organização

Associação que utiliza o sistema.

### Associado

Pessoa cadastrada na associação com acesso ao portal.

### Paciente

Pessoa vinculada ao tratamento medicinal.

### Tutor ou responsável

Pessoa que gerencia o acesso e os pedidos em nome de um paciente.

### Strain

Cadastro informativo da variedade cannábica.

### Produto

Item comercial ou associativo derivado de uma strain ou formulação.

### Lote

Unidade rastreável de estoque.

### Pedido

Solicitação de produto feita pelo paciente ou tutor.

### Separação

Etapa operacional onde a associação prepara o pedido.

### Entrega

Etapa de envio ou retirada do pedido.

### Rastreabilidade

Capacidade de saber qual paciente recebeu qual produto e lote.

## Regras iniciais de negócio

* Um pedido sempre pertence a uma organização.
* Um pedido sempre pertence a um paciente.
* Um tutor pode fazer pedidos em nome de um paciente.
* Um produto só pode ser solicitado se estiver disponível.
* Um lote só pode ser usado se estiver disponível e não vencido.
* A saída de estoque deve gerar movimentação.
* Todo pedido deve manter histórico de status.
* Documentos vencidos podem bloquear novos pedidos.
* O catálogo deve ter caráter informativo e educativo.
* Cada organização deve visualizar apenas seus próprios dados.

