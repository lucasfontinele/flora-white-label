# UI Kit — Portal do associado (Paciente / Tutor)

High-fidelity recreation of the **patient/associate portal**. Calm, card-led, single-column-ish, large touch targets — built for nervous or elderly users who must understand their orders at a glance.

**Screens** (`index.html` switches between them via the sidebar):
- **Início** — greeting, active order with live `OrderTimeline`, document reassurance banner, quick actions, recent `PedidoCard`s.
- **Meus pedidos** — filterable grid of `PedidoCard`s (`Tabs`: todos / em andamento / entregues).
- **Acompanhar entrega** — `DeliveryTracking` panel + full `OrderTimeline`.
- **Catálogo educativo** — grid of `StrainCard`s with an informational disclaimer banner.
- **Meus documentos** — document list with verification badges + upload.

**Composition:** uses the published primitives (`Button`, `Icon`, `Badge`, `Card`, `Input`, `Avatar`, `Tabs`, `Banner`) and domain components (`PedidoCard`, `OrderTimeline`, `DeliveryTracking`, `StrainCard`) from `window.FolhaDesignSystem_e132f0`. Sample data in `../data.js`. White sidebar, light register.

Files: `index.html`, `screens.jsx`, shared `../data.js`.
