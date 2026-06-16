# UI Kit — Operação & Diretoria (Admin console)

High-fidelity recreation of the **staff console**. Dense, fast, table-led — built for operators who resolve requests in a few clicks, and directors who want indicators at a glance. Dark petroleum sidebar signals the admin/governance context.

**Screens** (`index.html`):
- **Visão geral** — four `StatCard` KPIs, "pedidos por status" bar breakdown, low-stock list (Diretoria view).
- **Pedidos** — filterable orders **table** (`Tabs` + status/doc badges). Click any row to open the **detail drawer**: products, full `OrderTimeline`, doc-pending warning, and Recusar / Avançar status actions.
- Other nav items show a placeholder note (demo focuses on the two core surfaces).

**Composition:** uses `window.FolhaDesignSystem_e132f0` primitives (`Button`, `Icon`, `Badge`, `Card`, `Input`, `Avatar`, `Tabs`, `Banner`) + `OrderTimeline` and `StatCard`. Sample data in `../data.js`.

Files: `index.html`, `screens.jsx`, shared `../data.js`.
