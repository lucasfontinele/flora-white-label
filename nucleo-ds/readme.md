# Núcleo — Design System

> **Working brand name.** The brief did not supply a product name, so this system ships under the placeholder **Núcleo** ("core / nucleus" — evokes the operational infrastructure positioning). Swap the wordmark and the `--color-primary` token to rebrand. The project title "Folha" was auto-assigned and is *not* recommended (leaf imagery is explicitly off-brand — see below).

## What this product is

Núcleo is a **white-label, multi-tenant SaaS platform** for Brazilian **medical-cannabis associations** (*associações de cannabis medicinal*). It centralizes the entire operation of an association into one system: member/patient management, tutors/guardians, orders, inventory, an educational catalogue, documents, and product traceability.

**Positioning:** *"A infraestrutura operacional das associações de cannabis medicinal."* It is **not** an e-commerce store, **not** a recreational marketplace. It is a management, traceability and relationship platform between an association and its members.

### Who uses it (four roles)
1. **Associado / Paciente** — patients using medical cannabis (anxiety, chronic pain, ASD, elderly). Needs: understand orders, track deliveries, read documents, browse products, trust the process. Wants **simplicity and clarity**.
2. **Tutor / Responsável** — parents of autistic children, carers of the elderly. Manage multiple patients, documents, orders, history. Wants **efficiency and intuitive navigation**.
3. **Operador** — association staff (attendants, analysts, admin). Manage orders, approve documents, update status, control inventory. Wants **high-productivity flows, efficient tables, advanced filters**.
4. **Diretoria** — directors, presidents, coordinators. Need indicators, reports, inventory, growth. Want **executive dashboards and a sense of control**.

### Visual register
Reference set: **Stripe, Linear, Notion, Vercel, Headspace, Nubank (organization), Unimed (trust)**. Read as **HealthTech / FinTech / B2B SaaS / modern hospital system / telemedicine app**.

**Never:** "headshop" aesthetics, recreational cannabis culture, cannabis leaves scattered through the UI, psychedelic visuals, informal tone. Brand archetypes: **Caregiver, Sage, Ruler**. Avoid Rebel / Outlaw / Explorer / underground.

### Sources
No codebase or Figma was attached. This system was authored entirely from the written **Product Brief + Design System Prompt** provided by the user (June 2026). All tokens (color scale, neutrals, feedback colors, priority components) come directly from that brief. If a codebase or Figma exists, re-attach it and this system should be reconciled against the real product.

---

## CONTENT FUNDAMENTALS

The product is in **Brazilian Portuguese**. Copy is **calm, plain, and reassuring** — the opposite of hype. Think of a good clinic receptionist: warm, precise, never alarmist.

- **Voice:** human and institutional at once. We speak *to* the user as **você**, and refer to the organization as **sua associação**. First person plural ("Enviamos seu pedido para análise") is used for system actions on the patient's behalf.
- **Tone by surface:**
  - *Patient-facing* — gentle, encouraging, low jargon. "Seu pedido está sendo separado." "Tudo certo com seus documentos."
  - *Operator-facing* — terse, factual, scannable. "12 pedidos aguardando aprovação." "Estoque baixo: 3 itens."
- **Casing:** **Sentence case** everywhere — buttons, headings, menu items, table headers. Never Title Case or ALL CAPS for body content. The *only* uppercase is the eyebrow/overline label (`--tracking-wide`), used sparingly for section kickers ("CATÁLOGO EDUCATIVO").
- **Status language** is fixed and consistent (the order lifecycle): **Solicitado → Em análise → Aprovado → Em separação → Pronto para retirada → Enviado → Entregue**. Never paraphrase these.
- **Numbers & data:** Brazilian formatting — `R$ 1.250,00`, dates `15 jun 2026` or `15/06/2026`. Tracking codes and order numbers are monospace (`#PED-20482`, `BR4821morphine`-style codes).
- **Buttons** are verbs: "Fazer pedido", "Acompanhar entrega", "Enviar documento", "Aprovar". Avoid "Clique aqui" and vague "Enviar".
- **Reassurance over excitement.** No exclamation spam, no growth-hacky urgency. Trust signals ("Documento verificado", "Rastreamento atualizado") matter more than promotions.
- **Emoji:** **not used** in product UI. Status is communicated with outline icons + color, never emoji. (Brand is medical, not casual.)
- **Medical responsibility:** never make therapeutic claims. Strain data (THC/CBD/terpenes) is presented as **information**, not advice. Educational catalogue copy is descriptive and neutral.

**Examples**
- Empty state: *"Você ainda não tem pedidos. Quando fizer um, ele aparece aqui com o status atualizado."*
- Confirmation: *"Pedido #PED-20482 solicitado. Avisaremos quando a análise começar."*
- Operator toast: *"Documento aprovado. O associado foi notificado."*

---

## VISUAL FOUNDATIONS

The aesthetic is **clean clinical calm**: lots of white space, soft greens, rounded-but-restrained shapes, discreet shadows. Closer to a telemedicine dashboard than a dispensary.

### Color
- **Primary is institutional green `#2F6B4F`** (`--green-500`) — saúde, natureza, credibilidade. Used for primary actions, active nav, key emphasis. It is deep and muted, *not* a vivid "weed green."
- **Secondary petroleum blue `#1E4D5C`** (`--petrol-500`) — tecnologia, segurança, governança. Used for the inverse/dark surfaces (sidebars, executive headers), secondary emphasis, and data viz alongside green.
- **Accent soft green `#63C18C`** (`--accent-500`) — active states, positive indicators, focus ring, small highlights. Never as a large fill.
- **Neutrals** carry most of the UI. Page background is a barely-green off-white `#F8FAF9`; cards are pure white `#FFFFFF`. Text is near-black `#111827` / muted `#6B7280`.
- **Feedback** colors are standard and only used for status: success `#22C55E`, warning `#F59E0B`, error `#EF4444`, info `#3B82F6`, each with a `-subtle` tint background for badges/banners.
- **Imagery vibe:** clean, bright, naturally lit, slightly cool-neutral. Real product photography on neutral backgrounds; calm lifestyle/wellness imagery. **No** grungy textures, no neon, no smoke, no leaves-as-decoration.

### Type
- One family does the work: **Plus Jakarta Sans** (humanist-geometric) — friendly enough for nervous patients, sharp enough for an operator's data table. **JetBrains Mono** for codes, order numbers, tracking IDs, tabular figures.
- Scale runs 12 → 48px (`--text-xs` → `--text-3xl`). Dashboard hero numbers use `--text-2xl`/`800`. Body is 16px/1.5. Headings are bold (700) with tight tracking.
- **Substitution flag:** Plus Jakarta Sans + JetBrains Mono are loaded from Google Fonts (no licensed binaries were provided). If the real brand uses a specific typeface, supply the files and we'll self-host.

### Space, radius, shape
- **8px grid**, generous spacing. Density is *moderate* on patient screens, *tighter* on operator tables.
- **Radius is soft**: default `12px` (`--radius-md`) for cards/inputs/buttons, `16–24px` for large surfaces, full pill for chips/badges/avatars. Nothing sharp-cornered.
- **Cards:** white surface, `1px` `--border-subtle` *or* a soft shadow (rarely both), `--radius-md`/`lg`, padding `--space-5`/`6`. Calm, floating-but-grounded.

### Shadow, border, elevation
- Shadows are **discreet and soft** — low alpha, short spread (`--shadow-xs`→`xl`). Most cards use `--shadow-sm` or a hairline border, not heavy drop shadows.
- Borders are `1px`, `--border-subtle` (`#E5E7EB`) default. Dividers same.
- Primary buttons get a subtle tinted lift (`--shadow-primary`) to feel tactile without shouting.

### Motion
- **Quick and gentle, never bouncy.** `120–320ms`, standard easing `cubic-bezier(0.2,0,0.1,1)`. Fades and small translate/scale. The order **Timeline** animates progress smoothly. No spring overshoot, no parallax, no looping decorative motion.

### States
- **Hover:** darken by one step (primary → `--green-600`), or raise elevation one level; subtle background tint on list rows (`--green-50`).
- **Press/active:** darken another step (`--green-700`) + a 1–2px settle, no dramatic scale.
- **Focus:** `--focus-ring` (3px accent-green glow), always visible for accessibility.
- **Selected/active nav:** `--green-50` background, `--green-700` text, sometimes a 3px left/inline accent bar.

### Transparency & blur
- Used sparingly: modal overlays (`--surface-overlay`, petroleum at 45%), and occasionally a frosted top bar. Not a glassmorphism system.

### Layout rules
- App shell = fixed left **sidebar** (264px), fixed **top bar** (64px), scrolling content with a max content width (~1240px).
- Patient app leans single-column, card-led, big touch targets (≥44px). Operator app leans multi-column with tables, filters, and a detail drawer/panel.

---

## ICONOGRAPHY

- **Outline icons only**, ~`1.5px–2px` stroke, rounded caps/joins — matches the soft, calm geometry. No filled/duotone icon sets, no glyph emoji, no cannabis-leaf icons.
- **Library: [Lucide](https://lucide.dev)** (consistent outline set, rounded, MIT). Loaded from CDN in cards and kits via `https://unpkg.com/lucide@latest`. Chosen because no codebase icon set was provided; Lucide matches the intended stroke/round style. **Substitution flag** — replace with the product's real icon set when available.
- Typical icons: `package`, `truck`, `clipboard-list`, `file-text`, `shield-check`, `leaf`(avoid — use `sprout`/`flask-conical` for product/strain instead), `bell`, `search`, `users`, `box`, `check-circle-2`, `clock`, `map-pin`.
- Icons are **decorative-plus-functional**: paired with text labels in nav and buttons; standalone only in dense toolbars (with tooltips).
- **Emoji / unicode as icons:** not used.

---

## INDEX — what's in this system

**Foundations**
- `styles.css` — global entry (import this). Pulls `tokens/fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `base.css`.
- `tokens/` — all CSS custom properties.
- `foundations/` — specimen cards (Type, Colors, Spacing, Brand) shown in the Design System tab.

**Brand**
- `assets/` — logo (wordmark + mark), brand specimen.

**Components** (`components/`) — see each `*.prompt.md`:
- `core/` — Button, IconButton, Input, Select, Textarea, Checkbox, Switch, Badge, Tag, Avatar, Card, Tabs, Banner.
- `domain/` — PedidoCard, OrderTimeline, DeliveryTracking, StrainCard, StatCard.

**UI kits** (`ui_kits/`)
- `paciente/` — patient/associate app (orders, tracking, catalogue, documents).
- `operador/` — operator + directorate admin (orders table, order detail, dashboard).

**Meta**
- `SKILL.md` — Agent Skill wrapper.
- `readme.md` — this file.
