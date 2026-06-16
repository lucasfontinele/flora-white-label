/* global React */
const NS = window.FolhaDesignSystem_e132f0;
const { Button, Icon, Badge, Card, Input, Avatar, Tabs, Banner,
        PedidoCard, OrderTimeline, DeliveryTracking, StrainCard } = NS;
const D = window.NUCLEO_DATA;

const LOGO = '../../assets/logo-mark.svg';

/* ----------------------------------------------------------- App shell ---- */
function PacienteApp() {
  const [route, setRoute] = React.useState('inicio');
  const nav = [
    { id: 'inicio', label: 'Início', icon: 'home' },
    { id: 'pedidos', label: 'Meus pedidos', icon: 'package' },
    { id: 'acompanhar', label: 'Acompanhar entrega', icon: 'truck' },
    { id: 'catalogo', label: 'Catálogo', icon: 'book-open' },
    { id: 'documentos', label: 'Documentos', icon: 'file-text' },
  ];
  const titles = {
    inicio: 'Início', pedidos: 'Meus pedidos', acompanhar: 'Acompanhar entrega',
    catalogo: 'Catálogo educativo', documentos: 'Meus documentos',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-page)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)', flex: 'none', background: 'var(--surface-card)',
        borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px 16px' }}>
          <img src={LOGO} alt="" style={{ height: 34 }} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{D.tenant.nome}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Portal do associado</div>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 12px', flex: 1 }}>
          {nav.map((n) => {
            const on = route === n.id;
            return (
              <button key={n.id} onClick={() => setRoute(n.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                background: on ? 'var(--color-primary-subtle)' : 'transparent',
                color: on ? 'var(--green-700)' : 'var(--text-secondary)',
                font: 'var(--font-body)', fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                transition: 'background var(--duration-fast) var(--ease-standard)',
              }}
              onMouseEnter={(e)=>{ if(!on) e.currentTarget.style.background='var(--surface-sunken)'; }}
              onMouseLeave={(e)=>{ if(!on) e.currentTarget.style.background='transparent'; }}>
                <Icon name={n.icon} size={19} />{n.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={D.paciente.nome} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: 'var(--font-body-sm)', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{D.paciente.nome}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Associada {D.paciente.associada}</div>
          </div>
          <Icon name="settings" size={18} color="var(--text-tertiary)" />
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 'var(--topbar-height)', flex: 'none', background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 16, padding: '0 32px', position: 'sticky', top: 0, zIndex: 5,
        }}>
          <h1 style={{ font: 'var(--font-page-title)', fontSize: 'var(--text-lg)', flex: 1 }}>{titles[route]}</h1>
          <div style={{ width: 280 }}>
            <Input placeholder="Buscar pedido ou produto" leadingIcon={<Icon name="search" size={18} />} size="sm" />
          </div>
          <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6 }}>
            <Icon name="bell" size={21} />
            <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-error)', border: '2px solid #fff' }} />
          </button>
        </header>

        <main style={{ flex: 1, padding: '28px 32px', maxWidth: 'var(--container-max)', width: '100%' }}>
          {route === 'inicio' && <InicioScreen go={setRoute} />}
          {route === 'pedidos' && <PedidosScreen />}
          {route === 'acompanhar' && <AcompanharScreen />}
          {route === 'catalogo' && <CatalogoScreen />}
          {route === 'documentos' && <DocumentosScreen />}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Screens ---- */
function InicioScreen({ go }) {
  const ativo = D.pedidos[0];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ font: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>Olá, Maria 👋</div>
        <div style={{ font: 'var(--font-body)', color: 'var(--text-secondary)', marginTop: 4 }}>Você tem 1 pedido em andamento e seus documentos estão em dia.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, alignItems: 'start' }}>
        <Card padding="var(--space-6)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>Pedido em andamento</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', fontWeight: 600, marginTop: 2 }}>{ativo.numero}</div>
            </div>
            <Badge tone="info" dot>{ativo.status}</Badge>
          </div>
          <OrderTimeline current={ativo.status} timestamps={ativo.timestamps} />
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Button variant="primary" leftIcon={<Icon name="truck" size={18} />} onClick={() => go('acompanhar')}>Acompanhar entrega</Button>
            <Button variant="secondary" onClick={() => go('pedidos')}>Ver detalhes</Button>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Banner tone="success" title="Documentos em dia" icon={<Icon name="shield-check" size={18} />}>
            Sua receita é válida até 12 dez 2026.
          </Banner>
          <Card>
            <div style={{ font: 'var(--font-label)', color: 'var(--text-secondary)', marginBottom: 14 }}>Atalhos</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Quick icon="plus" label="Fazer pedido" />
              <Quick icon="book-open" label="Catálogo" onClick={() => go('catalogo')} />
              <Quick icon="file-text" label="Documentos" onClick={() => go('documentos')} />
              <Quick icon="message-circle" label="Falar com a associação" />
            </div>
          </Card>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ font: 'var(--font-heading)' }}>Pedidos recentes</h2>
          <a href="#" onClick={(e)=>{e.preventDefault(); go('pedidos');}} style={{ font: 'var(--font-body-sm)', fontWeight: 600 }}>Ver todos</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {D.pedidos.slice(0, 3).map((p) => <PedidoCard key={p.numero} {...p} onClick={() => {}} />)}
        </div>
      </div>
    </div>
  );
}

function Quick({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', cursor: 'pointer', textAlign: 'left',
      transition: 'all var(--duration-fast) var(--ease-standard)',
    }}
    onMouseEnter={(e)=>{ e.currentTarget.style.background='var(--color-primary-subtle)'; e.currentTarget.style.borderColor='var(--color-primary-border)'; }}
    onMouseLeave={(e)=>{ e.currentTarget.style.background='var(--surface-card)'; e.currentTarget.style.borderColor='var(--border-subtle)'; }}>
      <Icon name={icon} size={20} color="var(--color-primary)" />
      <span style={{ font: 'var(--font-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
    </button>
  );
}

function PedidosScreen() {
  const [filter, setFilter] = React.useState('todos');
  const tabs = [
    { value: 'todos', label: 'Todos', count: D.pedidos.length },
    { value: 'andamento', label: 'Em andamento' },
    { value: 'entregue', label: 'Entregues' },
  ];
  const list = D.pedidos.filter((p) =>
    filter === 'todos' ? true : filter === 'entregue' ? p.status === 'Entregue' : p.status !== 'Entregue');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Tabs tabs={tabs} value={filter} onChange={setFilter} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {list.map((p) => <PedidoCard key={p.numero} {...p} onClick={() => {}} />)}
      </div>
    </div>
  );
}

function AcompanharScreen() {
  const t = D.tracking;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
      <DeliveryTracking {...t} />
      <Card padding="var(--space-6)">
        <div style={{ font: 'var(--font-label)', color: 'var(--text-secondary)', marginBottom: 16 }}>Etapas do pedido</div>
        <OrderTimeline current={t.status} />
      </Card>
    </div>
  );
}

function CatalogoScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Banner tone="info" icon={<Icon name="info" size={18} />}>
        As informações abaixo são educativas e não substituem orientação médica.
      </Banner>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
        {D.catalogo.map((s) => <StrainCard key={s.nome} {...s} onClick={() => {}} />)}
      </div>
    </div>
  );
}

function DocumentosScreen() {
  const toneMap = { 'Aprovado': 'success', 'Em análise': 'warning', 'Recusado': 'error' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
      {D.documentos.map((doc) => (
        <Card key={doc.nome} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }}>
            <Icon name="file-text" size={20} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ font: 'var(--font-body)', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.nome}</div>
            <div style={{ font: 'var(--font-body-sm)', color: 'var(--text-secondary)' }}>{doc.validade}</div>
          </div>
          <Badge tone={toneMap[doc.status]} dot>{doc.status}</Badge>
          <Button variant="ghost" size="sm" rightIcon={<Icon name="download" size={16} />}>Baixar</Button>
        </Card>
      ))}
      <Button variant="secondary" leftIcon={<Icon name="upload" size={18} />} style={{ alignSelf: 'flex-start' }}>Enviar novo documento</Button>
    </div>
  );
}

window.PacienteApp = PacienteApp;
