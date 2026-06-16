/* global React */
const ONS = window.FolhaDesignSystem_e132f0;
const { Button, Icon, Badge, Card, Input, Select, Avatar, Tabs, Banner, Checkbox,
        OrderTimeline, StatCard } = ONS;
const OD = window.NUCLEO_DATA;
const OLOGO = '../../assets/logo-mark.svg';
const OLOGO_LIGHT = '../../assets/logo-wordmark-light.svg';

const TONE = {
  'Solicitado': 'neutral', 'Em análise': 'warning', 'Aprovado': 'primary',
  'Em separação': 'info', 'Pronto para retirada': 'accent', 'Enviado': 'petrol',
  'Entregue': 'success', 'Recusado': 'error',
};

/* ----------------------------------------------------------- App shell ---- */
function OperadorApp() {
  const [route, setRoute] = React.useState('dashboard');
  const [selected, setSelected] = React.useState(null);
  const nav = [
    { id: 'dashboard', label: 'Visão geral', icon: 'layout-dashboard' },
    { id: 'pedidos', label: 'Pedidos', icon: 'inbox', count: 8 },
    { id: 'associados', label: 'Associados', icon: 'users' },
    { id: 'estoque', label: 'Estoque', icon: 'boxes' },
    { id: 'catalogo', label: 'Catálogo', icon: 'book-open' },
    { id: 'documentos', label: 'Documentos', icon: 'file-check' },
  ];
  const titles = { dashboard: 'Visão geral', pedidos: 'Pedidos', associados: 'Associados', estoque: 'Estoque', catalogo: 'Catálogo', documentos: 'Documentos' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-page)' }}>
      {/* Dark admin sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)', flex: 'none', background: 'var(--petrol-700)',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '20px 20px 18px' }}>
          <img src={OLOGO_LIGHT} alt="Núcleo" style={{ height: 32 }} />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 8, letterSpacing: '0.02em' }}>{OD.tenant.nome} · Operação</div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 12px', flex: 1 }}>
          {nav.map((n) => {
            const on = route === n.id;
            return (
              <button key={n.id} onClick={() => { setRoute(n.id); setSelected(null); }} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                background: on ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: on ? '#fff' : 'rgba(255,255,255,0.7)',
                font: 'var(--font-body)', fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                transition: 'background var(--duration-fast) var(--ease-standard)',
              }}
              onMouseEnter={(e)=>{ if(!on) e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e)=>{ if(!on) e.currentTarget.style.background='transparent'; }}>
                <Icon name={n.icon} size={19} />
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.count && <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--color-accent)', color: 'var(--green-900)', borderRadius: 'var(--radius-pill)', padding: '1px 8px' }}>{n.count}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="Lucas Operador" tone="neutral" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: 'var(--font-body-sm)', fontWeight: 600, color: '#fff' }}>Lucas Andrade</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Operador</div>
          </div>
          <Icon name="log-out" size={18} color="rgba(255,255,255,0.5)" />
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 'var(--topbar-height)', flex: 'none', background: 'var(--surface-card)',
          borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px', position: 'sticky', top: 0, zIndex: 5,
        }}>
          <h1 style={{ font: 'var(--font-page-title)', fontSize: 'var(--text-lg)', flex: 1 }}>{titles[route]}</h1>
          <div style={{ width: 300 }}>
            <Input placeholder="Buscar pedido, associado ou produto" leadingIcon={<Icon name="search" size={18} />} size="sm" />
          </div>
          <Button size="sm" variant="secondary" leftIcon={<Icon name="filter" size={16} />}>Filtros</Button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6 }}><Icon name="bell" size={21} /></button>
        </header>

        <main style={{ flex: 1, padding: '24px 28px', minWidth: 0 }}>
          {route === 'dashboard' && <DashboardScreen go={setRoute} />}
          {route === 'pedidos' && <PedidosTable onOpen={setSelected} />}
          {route !== 'dashboard' && route !== 'pedidos' && <Placeholder title={titles[route]} />}
        </main>
      </div>

      {selected && <PedidoDrawer pedido={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------ Dashboard ---- */
function DashboardScreen({ go }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {OD.metrics.map((m) => <StatCard key={m.label} {...m} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
        <Card padding="var(--space-6)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ font: 'var(--font-heading)' }}>Pedidos por status</h2>
            <Badge tone="neutral">Junho 2026</Badge>
          </div>
          <StatusBars />
        </Card>

        <Card padding="var(--space-6)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ font: 'var(--font-heading)' }}>Estoque baixo</h2>
            <a href="#" onClick={(e)=>{e.preventDefault(); go('estoque');}} style={{ font: 'var(--font-body-sm)', fontWeight: 600 }}>Ver estoque</a>
          </div>
          {[
            { nome: 'Óleo CBD 17% — 30ml', qtd: '4 un.', tone: 'error' },
            { nome: 'Pomada CBD 500mg', qtd: '9 un.', tone: 'warning' },
            { nome: 'Charlotte\u2019s Web — flor', qtd: '12 g', tone: 'warning' },
          ].map((i) => (
            <div key={i.nome} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><Icon name="box" size={18} /></span>
              <span style={{ flex: 1, font: 'var(--font-body-sm)', fontWeight: 600 }}>{i.nome}</span>
              <Badge tone={i.tone} size="sm">{i.qtd}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function StatusBars() {
  const data = [
    { label: 'Solicitado', n: 18 }, { label: 'Em análise', n: 8 }, { label: 'Aprovado', n: 12 },
    { label: 'Em separação', n: 9 }, { label: 'Pronto para retirada', n: 6 }, { label: 'Enviado', n: 14 }, { label: 'Entregue', n: 75 },
  ];
  const max = Math.max(...data.map((d) => d.n));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 150, flex: 'none', font: 'var(--font-body-sm)', color: 'var(--text-secondary)' }}>{d.label}</span>
          <div style={{ flex: 1, height: 10, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div style={{ width: `${(d.n / max) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 'var(--radius-pill)' }} />
          </div>
          <span style={{ width: 28, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{d.n}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------- Pedidos table - */
function PedidosTable({ onOpen }) {
  const [tab, setTab] = React.useState('todos');
  const tabs = [
    { value: 'todos', label: 'Todos', count: OD.fila.length },
    { value: 'analise', label: 'Aguardando análise', count: 2 },
    { value: 'separacao', label: 'Em separação' },
    { value: 'entregue', label: 'Entregues' },
  ];
  const rows = OD.fila.filter((r) => {
    if (tab === 'analise') return r.status === 'Em análise' || r.status === 'Solicitado';
    if (tab === 'separacao') return r.status === 'Em separação';
    if (tab === 'entregue') return r.status === 'Entregue';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <Button size="sm" variant="primary" leftIcon={<Icon name="plus" size={16} />}>Novo pedido</Button>
      </div>

      <Card padding="0" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-sunken)' }}>
              {['Pedido', 'Associado', 'Status', 'Itens', 'Entrega', 'Documento', 'Data', ''].map((h, i) => (
                <th key={i} style={{ textAlign: i === 3 ? 'center' : 'left', padding: '12px 16px', font: 'var(--font-label)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.numero} onClick={() => onOpen(r)} style={{ borderTop: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                onMouseEnter={(e)=>{ e.currentTarget.style.background='var(--green-50)'; }}
                onMouseLeave={(e)=>{ e.currentTarget.style.background='transparent'; }}>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{r.numero}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={r.paciente} size={30} />
                    <span style={{ font: 'var(--font-body-sm)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.paciente}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}><Badge tone={TONE[r.status]} dot>{r.status}</Badge></td>
                <td style={{ padding: '14px 16px', textAlign: 'center', font: 'var(--font-body-sm)' }}>{r.itens}</td>
                <td style={{ padding: '14px 16px', font: 'var(--font-body-sm)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.entrega}</td>
                <td style={{ padding: '14px 16px' }}><Badge tone={r.doc === 'OK' ? 'success' : 'warning'} size="sm">{r.doc === 'OK' ? 'Verificado' : 'Pendente'}</Badge></td>
                <td style={{ padding: '14px 16px', font: 'var(--font-body-sm)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.data}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}><Icon name="chevron-right" size={18} color="var(--text-tertiary)" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------- Drawer ------ */
function PedidoDrawer({ pedido, onClose }) {
  const produtos = (D_LOOKUP(pedido.numero) || {}).produtos || [
    { nome: 'Óleo CBD 17% — 30ml', qtd: 1 }, { nome: 'Pomada CBD 500mg', qtd: 1 },
  ];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--surface-overlay)', zIndex: 40, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 440, maxWidth: '92vw', background: 'var(--surface-card)', height: '100vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column',
        animation: 'nucleo-slide var(--duration-slow) var(--ease-emphasized)',
      }}>
        <style>{`@keyframes nucleo-slide{from{transform:translateX(24px);opacity:.6}to{transform:none;opacity:1}}`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, background: 'var(--surface-card)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', fontWeight: 600 }}>{pedido.numero}</div>
            <div style={{ font: 'var(--font-body-sm)', color: 'var(--text-secondary)' }}>{pedido.paciente} · {pedido.data}</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-sunken)', border: 'none', borderRadius: 'var(--radius-sm)', width: 34, height: 34, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={18} /></button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge tone={TONE[pedido.status]} dot>{pedido.status}</Badge>
            <Badge tone={pedido.doc === 'OK' ? 'success' : 'warning'} size="sm">Doc. {pedido.doc === 'OK' ? 'verificado' : 'pendente'}</Badge>
          </div>

          {pedido.doc !== 'OK' && (
            <Banner tone="warning" title="Documento pendente" icon={<Icon name="alert-triangle" size={18} />}>
              Aprove a receita do associado antes de avançar o pedido.
            </Banner>
          )}

          <section>
            <div style={{ font: 'var(--font-label)', color: 'var(--text-secondary)', marginBottom: 12 }}>Produtos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {produtos.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}>
                  <Icon name="pill" size={18} color="var(--text-secondary)" />
                  <span style={{ flex: 1, font: 'var(--font-body-sm)', fontWeight: 600 }}>{p.nome}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>×{p.qtd}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div style={{ font: 'var(--font-label)', color: 'var(--text-secondary)', marginBottom: 14 }}>Linha do tempo</div>
            <OrderTimeline current={pedido.status} />
          </section>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 10, padding: 20, borderTop: '1px solid var(--border-subtle)', position: 'sticky', bottom: 0, background: 'var(--surface-card)' }}>
          <Button variant="danger" size="md" style={{ flex: 'none' }}>Recusar</Button>
          <Button variant="primary" fullWidth leftIcon={<Icon name="arrow-right" size={18} />}>Avançar status</Button>
        </div>
      </div>
    </div>
  );
}

function D_LOOKUP(numero) { return OD.pedidos.find((p) => p.numero === numero); }

function Placeholder({ title }) {
  return (
    <Card padding="var(--space-8)" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
      <Icon name="construction" size={28} color="var(--text-tertiary)" style={{ margin: '0 auto 10px' }} />
      <div style={{ font: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
      <div style={{ font: 'var(--font-body-sm)' }}>Esta tela faz parte do kit completo. Demonstração focada em Visão geral e Pedidos.</div>
    </Card>
  );
}

window.OperadorApp = OperadorApp;
