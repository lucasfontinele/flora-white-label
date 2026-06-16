# 03 — Telas do MVP

## Objetivo

Definir as telas necessárias para o MVP da plataforma white label para associações cannábicas.

O foco principal do MVP será:

* Área do associado
* Área da organização
* Catálogo educativo
* Listagem de pedidos
* Detalhe de pedido
* Status e etapas do pedido
* Informações de entrega
* Gestão básica de estoque

## Área do Associado

## 1. Login

Tela de autenticação simples.

Campos:

* E-mail
* Senha

Ações:

* Entrar
* Esqueci minha senha

## 2. Dashboard do Associado

Objetivo: dar uma visão rápida da situação do paciente.

Cards principais:

* Receita válida até
* Status do cadastro
* Último pedido
* Próximo vencimento de documento

Se o usuário for tutor, exibir seletor de paciente:

```txt
Você está gerenciando:
[ João Silva ▼ ]
```

## 3. Catálogo Educativo

Tela com listagem de produtos disponíveis.

Cada card deve exibir:

* Imagem
* Nome do produto
* Tipo
* THC
* CBD
* Tags
* Disponibilidade

Exemplo de card:

```txt
Purple Punch 10g
Flor | Híbrida
THC 22% | CBD 1%
Tags: Sono, Relaxamento, Dor
Disponível
```

Filtros:

* Tipo de produto
* Strain
* THC/CBD
* Tags
* Disponibilidade

## 4. Detalhe do Produto

Tela informativa.

Seções:

* Imagem principal
* Nome
* Descrição
* Informações da strain
* Canabinoides
* Terpenos
* Efeitos relatados
* Aromas
* Produtos relacionados

Aviso fixo:

```txt
As informações apresentadas possuem caráter educativo e não substituem orientação médica.
```

Ação principal:

```txt
Solicitar produto
```

## 5. Meus Pedidos

Tela extremamente importante para o MVP.

Objetivo: permitir que o associado acompanhe seus pedidos com clareza.

Cada pedido deve aparecer como card.

Informações do card:

* Código do pedido
* Data
* Status atual
* Quantidade de itens
* Tipo de entrega
* Previsão de entrega ou retirada

Exemplo:

```txt
Pedido #1024
Solicitado em 15/06/2026
Status: Em separação
2 produtos
Entrega prevista: 18/06/2026
```

Filtros:

* Todos
* Em análise
* Aprovados
* Em separação
* Enviados
* Entregues
* Cancelados

## 6. Detalhe do Pedido

Tela central do MVP.

Deve mostrar uma linha do tempo clara das etapas.

Status possíveis:

```txt
Solicitado
Em análise
Aprovado
Em separação
Pronto para retirada
Enviado
Entregue
Cancelado
```

Componente principal:

```txt
Timeline do pedido
```

Exemplo visual:

```txt
✓ Pedido solicitado
✓ Pedido aprovado
✓ Em separação
○ Enviado
○ Entregue
```

Seções da tela:

### Resumo

* Número do pedido
* Data de criação
* Status atual
* Paciente vinculado

### Produtos

* Nome
* Quantidade
* Tipo
* Imagem

### Entrega ou retirada

Se for entrega:

* Endereço
* Transportadora
* Código de rastreio
* Previsão de entrega
* Status de envio

Se for retirada:

* Unidade de retirada
* Endereço
* Horário disponível
* Instruções

### Histórico de status

Exemplo:

```txt
15/06/2026 09:00 — Pedido solicitado
15/06/2026 11:30 — Pedido aprovado
15/06/2026 15:20 — Pedido em separação
```

## 7. Documentos

Tela para envio e acompanhamento de documentos.

Cards:

* Receita médica
* Laudo médico
* Documento pessoal
* Comprovante de residência

Status:

```txt
Pendente
Em análise
Aprovado
Rejeitado
Vencido
```

Ações:

* Enviar documento
* Substituir documento
* Ver motivo da rejeição

---

# Área da Organização

## 8. Dashboard Operacional

Cards:

* Pedidos pendentes
* Pedidos em separação
* Pedidos enviados
* Associados ativos
* Produtos com estoque baixo
* Documentos aguardando análise

## 9. Pedidos da Organização

Tela principal para operadores.

Tabela com:

* Código
* Paciente
* Associado ou tutor
* Data
* Status
* Tipo de entrega
* Responsável interno

Filtros:

* Status
* Data
* Paciente
* Tipo de entrega
* Produto

Ações rápidas:

* Ver detalhe
* Aprovar
* Rejeitar
* Enviar para separação
* Marcar como enviado
* Marcar como entregue

## 10. Detalhe do Pedido no Backoffice

Tela operacional.

Seções:

### Dados do pedido

* Código
* Status
* Data
* Paciente
* Associado responsável
* Documentos vinculados

### Dados médicos

* Receita válida
* Laudo aprovado
* Observações internas

### Itens do pedido

* Produto
* Quantidade
* Lote selecionado
* Estoque disponível

### Gestão de status

Botões conforme status atual:

```txt
Aprovar pedido
Rejeitar pedido
Enviar para separação
Marcar como pronto
Marcar como enviado
Marcar como entregue
Cancelar pedido
```

### Informações de entrega

Campos editáveis:

* Tipo de entrega
* Endereço
* Transportadora
* Código de rastreio
* Previsão
* Observações

### Histórico interno

Registrar toda mudança:

* Quem alterou
* Quando alterou
* Status anterior
* Novo status
* Observação

## 11. Associados

Tela para gestão de associados.

Tabela:

* Nome
* CPF
* E-mail
* Status
* Tipo
* Data de cadastro

Ações:

* Ver perfil
* Aprovar cadastro
* Bloquear
* Editar

## 12. Perfil do Associado

Seções:

* Dados pessoais
* Pacientes vinculados
* Documentos
* Pedidos
* Observações internas

## 13. Strains

Tela para pré-cadastro de strains.

Campos:

* Nome
* Tipo
* THC
* CBD
* Terpenos
* Aromas
* Efeitos relatados
* Descrição educativa
* Imagem
* Tags

Objetivo: criar uma base visual e educativa para alimentar o catálogo.

## 14. Produtos

Tela para cadastro dos produtos da associação.

Campos:

* Nome
* Tipo
* Strain vinculada
* Descrição
* Imagem
* Status de disponibilidade

## 15. Estoque

Tela para controle de lotes.

Tabela:

* Produto
* Lote
* Quantidade inicial
* Quantidade disponível
* Validade
* Status

Ações:

* Entrada de estoque
* Ajuste
* Perda
* Descarte
* Ver movimentações

## 16. Relatórios MVP

Relatórios simples:

* Pedidos por período
* Produtos mais solicitados
* Estoque baixo
* Documentos vencidos
* Associados ativos
* Pedidos por status

## Componentes visuais importantes

O MVP deve priorizar os seguintes componentes:

* Cards de status
* Timeline de pedido
* Badges coloridas por status
* Tabelas filtráveis
* Cards de produto
* Empty states amigáveis
* Alertas de documento vencido
* Indicadores de estoque baixo

## Prioridade de desenvolvimento

### Fase 1

* Login
* Dashboard associado
* Catálogo
* Meus pedidos
* Detalhe do pedido
* Dashboard organização
* Listagem de pedidos
* Detalhe do pedido no backoffice

### Fase 2

* Documentos
* Associados
* Strains
* Produtos
* Estoque

### Fase 3

* Relatórios
* White label avançado
* Notificações
* Integrações financeiras


A solução irá se chamar Flora, o nome dos projetos pode seguir esse padrão de flora-white-label coisas do gênero.
