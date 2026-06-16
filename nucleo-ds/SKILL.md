---
name: nucleo-design
description: Use this skill to generate well-branded interfaces and assets for Núcleo — the white-label SaaS platform for Brazilian medical-cannabis associations (gestão, rastreabilidade, relacionamento) — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. HealthTech/FinTech register; never headshop/recreational.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

Núcleo is a medical-cannabis **association management** platform — not an e-commerce store, not a recreational marketplace. Visual register is HealthTech / FinTech / modern hospital system (Stripe · Linear · Notion · Headspace · Unimed). Primary is institutional green `#2F6B4F`; secondary petroleum blue `#1E4D5C`. **Avoid** cannabis leaves, psychedelic/headshop aesthetics, informal tone, emoji in product UI. Copy is Brazilian Portuguese, calm and reassuring, sentence case. The order lifecycle vocabulary is fixed: Solicitado → Em análise → Aprovado → Em separação → Pronto para retirada → Enviado → Entregue.

Key files:
- `readme.md` — full brand guide (content fundamentals, visual foundations, iconography, index).
- `styles.css` — global token entry point (link this). Tokens in `tokens/`.
- `components/core/` + `components/domain/` — React primitives and the domain components (PedidoCard, OrderTimeline, DeliveryTracking, StrainCard, StatCard).
- `ui_kits/paciente/` and `ui_kits/operador/` — full interactive screen recreations.
- `assets/` — logo (placeholder) and brand specimen.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. Load components from the compiled bundle via `<script src=".../_ds_bundle.js">` and `const { Button } = window.FolhaDesignSystem_e132f0`. Icons: Lucide via CDN (`https://unpkg.com/lucide@latest`), outline only — never a cannabis-leaf icon. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask what they want to build, ask a few questions, and act as an expert designer who outputs HTML artifacts or production code.
