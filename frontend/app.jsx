
const { useState, useEffect, useRef, useCallback } = React;

// ─── API ────────────────────────────────────────────────────────────────────
const API_URL = (window.API_BASE || '') + '/api';

const normalizeTx = (tx) => ({
  ...tx,
  modalTotal: tx.modal_total ?? tx.modalTotal ?? 0,
  items: (tx.items || []).map(item => ({
    ...item,
    productId: item.product_id ?? item.productId,
  }))
});


// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = 'currentColor' }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    kasir: <><path d="M2 7h20v14a1 1 0 01-1 1H3a1 1 0 01-1-1V7z"/><path d="M22 7l-2-4H4L2 7"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></>,
    produk: <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    stok: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    laporan: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
    supplier: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    minus: <line x1="5" y1="12" x2="19" y2="12"/>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    trending_up: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    trending_down: <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>,
    cart: <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    chevron_down: <polyline points="6 9 12 15 18 9"/>,
    chevron_right: <polyline points="9 18 15 12 9 6"/>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    warning: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    pesanan: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || null}
    </svg>
  );
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const fmtShort = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}Jt` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n;

// ─── RESPONSIVE HOOK ─────────────────────────────────────────────────────────
const useResponsive = () => {
  const get = () => {
    const w = window.innerWidth;
    return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  };
  const [bp, setBp] = useState(() => get());
  useEffect(() => {
    const h = () => setBp(get());
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { bp, isMobile: bp === 'mobile', isTablet: bp === 'tablet', isDesktop: bp === 'desktop' };
};


// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, trend, icon, color, wide }) => {
  const colors = {
    blue: { bg: '#EEF2FF', icon: '#3E3DE1' },
    green: { bg: '#DCFCE7', icon: '#16A34A' },
    orange: { bg: '#FEF3C7', icon: '#D97706' },
    purple: { bg: '#F3E8FF', icon: '#9333EA' },
    red: { bg: '#FEE2E2', icon: '#DC2626' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', boxShadow: 'var(--shadow)', flex: 1, minWidth: 160 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={20} color={c.icon} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--danger)' : 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
            {trend === 'up' && <span>↑</span>}
            {trend === 'down' && <span>↓</span>}
            {sub}
          </div>}
        </div>
      </div>
    </div>
  );
};

// ─── MINI CHART (SVG line chart) ──────────────────────────────────────────────
const MiniChart = ({ data, color, height = 60, width = 120 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const pathD = 'M ' + pts.join(' L ');
  const fillD = pathD + ` L ${width},${height} L 0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#grad-${color.replace('#','')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── DONUT CHART ──────────────────────────────────────────────────────────────
const DonutChart = ({ data, size = 160 }) => {
  const colors = ['#3E3DE1', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumAngle = -Math.PI / 2;
  const r = size / 2 - 20;
  const cx = size / 2, cy = size / 2;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { pathD, color: colors[i % colors.length], label: d.label, value: d.value, pct: Math.round((d.value / total) * 100) };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.pathD} fill={s.color} opacity="0.9" />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827" fontFamily="'Plus Jakarta Sans', sans-serif">Total</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill="#6B7280" fontFamily="'DM Sans', sans-serif">{total} pcs</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-primary)', flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>{s.value} pcs</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', width: 28, textAlign: 'right' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── LINE CHART ───────────────────────────────────────────────────────────────
const LineChart = ({ salesData, profitData, labels }) => {
  const w = 580, h = 180, pad = { top: 10, right: 10, bottom: 30, left: 52 };
  const allVals = [...salesData, ...profitData];
  const maxV = Math.max(...allVals);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(maxV * t / 50000) * 50000);
  const toX = (i) => pad.left + (i / (labels.length - 1)) * (w - pad.left - pad.right);
  const toY = (v) => pad.top + (1 - v / maxV) * (h - pad.top - pad.bottom);
  const linePath = (data) => data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');
  const areaPath = (data) => linePath(data) + ` L ${toX(data.length-1)} ${h - pad.bottom} L ${toX(0)} ${h - pad.bottom} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3E3DE1" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#3E3DE1" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} y1={toY(t)} x2={w - pad.right} y2={toY(t)} stroke="#F3F4F6" strokeWidth="1" />
          <text x={pad.left - 6} y={toY(t) + 4} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="'DM Sans', sans-serif">{fmtShort(t)}</text>
        </g>
      ))}
      {labels.map((l, i) => i % 3 === 0 && (
        <text key={i} x={toX(i)} y={h - 4} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="'DM Sans', sans-serif">{l}</text>
      ))}
      <path d={areaPath(salesData)} fill="url(#salesGrad)" />
      <path d={areaPath(profitData)} fill="url(#profitGrad)" />
      <path d={linePath(salesData)} fill="none" stroke="#3E3DE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={linePath(profitData)} fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0" />
      {salesData.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill="#3E3DE1" />
      ))}
    </svg>
  );
};

// ─── BAR CHART ────────────────────────────────────────────────────────────────
const BarChart = ({ data }) => {
  const w = 400, h = 160, pad = { top: 10, right: 10, bottom: 30, left: 48 };
  const maxV = Math.max(...data.map(d => d.value));
  const bw = (w - pad.left - pad.right) / data.length - 8;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {[0, 0.5, 1].map((t, i) => {
        const v = Math.round(maxV * t / 50000) * 50000;
        const y = pad.top + (1 - t) * (h - pad.top - pad.bottom);
        return <g key={i}>
          <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#F3F4F6" strokeWidth="1" />
          <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="'DM Sans', sans-serif">{fmtShort(v)}</text>
        </g>;
      })}
      {data.map((d, i) => {
        const bh = ((d.value / maxV) * (h - pad.top - pad.bottom));
        const x = pad.left + i * ((w - pad.left - pad.right) / data.length) + 4;
        const y = h - pad.bottom - bh;
        return <g key={i}>
          <rect x={x} y={y} width={bw} height={bh} rx="4" fill="#3E3DE1" opacity="0.85" />
          <text x={x + bw / 2} y={h - 4} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontFamily="'DM Sans', sans-serif">{d.label}</text>
        </g>;
      })}
    </svg>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'kasir', label: 'Kasir', icon: 'kasir' },
  { id: 'pesanan', label: 'Pesanan', icon: 'pesanan' },
  { id: 'produk', label: 'Produk', icon: 'produk' },
  { id: 'stok', label: 'Stok', icon: 'stok' },
  { id: 'laporan', label: 'Laporan', icon: 'laporan' },
  { id: 'supplier', label: 'Supplier', icon: 'supplier' },
  { id: 'pengaturan', label: 'Pengaturan', icon: 'settings' },
];

const Sidebar = ({ active, onNav }) => (
  <aside style={{ width: 'var(--sidebar-w)', background: 'var(--card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100 }}>
    {/* Logo */}
    <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🥐</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1 }}>Risol Teman</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>Risol Enak, Teman Setia</div>
        </div>
      </div>
    </div>
    {/* Nav */}
    <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {navItems.map(item => {
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => onNav(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: 'none', background: isActive ? 'var(--primary-light)' : 'transparent', color: isActive ? 'var(--primary)' : 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: isActive ? 600 : 400, fontSize: 13.5, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <Icon name={item.icon} size={16} color={isActive ? 'var(--primary)' : '#9CA3AF'} />
            {item.label}
          </button>
        );
      })}
    </nav>
    {/* User */}
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>W</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Wicky</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Kasir</div>
        </div>
      </div>
      <button onClick={() => onNav('logout')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 12.5, cursor: 'pointer', width: '100%' }}>
        <Icon name="logout" size={14} color="#9CA3AF" />
        Logout
      </button>
    </div>
  </aside>
);


// ─── BOTTOM NAV (mobile) ──────────────────────────────────────────────────────
const BottomNav = ({ active, onNav }) => {
  const mobileItems = navItems.filter(i => ['dashboard','kasir','stok','laporan','pengaturan'].includes(i.id));
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'var(--card)', borderTop:'1px solid var(--border)', display:'flex', zIndex:200, paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
      {mobileItems.map(item => {
        const on = active === item.id;
        return (
          <button key={item.id} onClick={() => onNav(item.id)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, paddingTop:10, paddingBottom:10, border:'none', background:'transparent', color: on ? 'var(--primary)' : '#9CA3AF', fontSize:10, fontWeight: on ? 600 : 400, fontFamily:'var(--font-body)', minHeight:56 }}>
            <Icon name={item.icon} size={20} color={on ? 'var(--primary)' : '#9CA3AF'} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
const Topbar = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', rowGap: 8 }}>
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0', fontFamily: 'var(--font-body)' }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
  </div>
);

// ─── BADGE ────────────────────────────────────────────────────────────────────
const Badge = ({ label, type = 'neutral' }) => {
  const styles = {
    success: { bg: '#DCFCE7', color: '#15803D' },
    warning: { bg: '#FEF3C7', color: '#B45309' },
    danger: { bg: '#FEE2E2', color: '#B91C1C' },
    neutral: { bg: '#F3F4F6', color: '#374151' },
    primary: { bg: '#EEF2FF', color: '#3730A3' },
  };
  const s = styles[type] || styles.neutral;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 11.5, fontWeight: 600 }}>{label}</span>
  );
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  return [toasts, addToast];
};

const ToastContainer = ({ toasts }) => {
  if (!toasts.length) return null;
  const cfg = {
    success: { bg: '#DCFCE7', border: '#16A34A', text: '#15803D', icon: 'check' },
    error:   { bg: '#FEE2E2', border: '#EF4444', text: '#B91C1C', icon: 'x' },
    warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309', icon: 'warning' },
  };
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9000, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => {
        const c = cfg[t.type] || cfg.success;
        return (
          <div key={t.id} style={{ background: c.bg, border: `1.5px solid ${c.border}20`, borderLeft: `4px solid ${c.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', minWidth: 260, maxWidth: 360 }}>
            <Icon name={c.icon} size={16} color={c.border} />
            <span style={{ fontSize: 13.5, fontWeight: 500, color: c.text, fontFamily: 'var(--font-body)', flex: 1 }}>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── EXPORT CSV ───────────────────────────────────────────────────────────────
const exportCSV = (filename, headers, rows) => {
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ─── DATE RANGE PICKER ────────────────────────────────────────────────────────
const DateRangePicker = ({ from, to, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const presets = [
    { label: 'Hari Ini', days: 0 },
    { label: '7 Hari', days: 6 },
    { label: 'Bulan Ini', monthStart: true },
    { label: '30 Hari', days: 29 },
  ];

  const applyPreset = ({ days, monthStart }) => {
    const t = new Date().toISOString().slice(0, 10);
    let f;
    if (monthStart) {
      const n = new Date();
      f = new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10);
    } else {
      f = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    }
    onChange(f, t);
    setOpen(false);
  };

  const formatRange = () => {
    if (!from || !to) return 'Pilih Tanggal';
    const f = new Date(from + 'T00:00:00');
    const t = new Date(to + 'T00:00:00');
    if (from === to) return f.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${f.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – ${t.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--border)', background: open ? 'var(--primary-light)' : 'white', color: open ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
        <Icon name="calendar" size={14} color={open ? 'var(--primary)' : '#9CA3AF'} />
        {formatRange()}
        <Icon name="chevron_down" size={12} color={open ? 'var(--primary)' : '#9CA3AF'} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-md)', zIndex: 300, minWidth: 290 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {presets.map(p => (
              <button key={p.label} onClick={() => applyPreset(p)} style={{ padding: '5px 12px', borderRadius: 99, border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Dari</label>
              <input type="date" value={from} max={to} onChange={e => onChange(e.target.value, to)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Sampai</label>
              <input type="date" value={to} min={from} max={new Date().toISOString().slice(0, 10)} onChange={e => onChange(from, e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
const DashboardPage = ({ products }) => {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

  const [summary, setSummary] = useState(null);
  const [prevSummary, setPrevSummary] = useState(null);
  const [salesSeries, setSalesSeries] = useState([]);
  const [loadingReport, setLoadingReport] = useState(true);

  useEffect(() => {
    setLoadingReport(true);
    Promise.all([
      fetch(`${API_URL}/reports/summary?from=${today}&to=${today}`).then(r => r.json()),
      fetch(`${API_URL}/reports/summary?from=${yesterday}&to=${yesterday}`).then(r => r.json()),
      fetch(`${API_URL}/reports/sales?from=${sevenDaysAgo}&to=${today}&group=day`).then(r => r.json()),
    ]).then(([s, ps, sales]) => {
      setSummary(s);
      setPrevSummary(ps);
      setSalesSeries(sales.data || []);
    }).catch(console.error)
      .finally(() => setLoadingReport(false));
  }, [today]);

  const pct = (curr, prev) => (prev > 0 ? ((curr - prev) / prev * 100).toFixed(1) : null);

  const totalSales = summary?.revenue ?? 0;
  const totalProfit = summary?.profit ?? 0;
  const totalTx = summary?.transactionCount ?? 0;
  const avgMargin = summary?.margin ?? 0;
  const lowStock = summary?.lowStock ?? [];
  const topProducts = summary?.topProducts ?? [];

  const salesPct   = pct(totalSales,  prevSummary?.revenue          ?? 0);
  const profitPct  = pct(totalProfit, prevSummary?.profit           ?? 0);
  const txPct      = pct(totalTx,     prevSummary?.transactionCount ?? 0);

  const trendLabel = (p) => p !== null ? `${Number(p) >= 0 ? '↑' : '↓'} ${Math.abs(p)}% vs kemarin` : 'Belum ada data kemarin';
  const trendDir   = (p) => p !== null ? (Number(p) > 0 ? 'up' : 'down') : undefined;

  // Fill all 7 days (missing days → 0)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().slice(0, 10);
    const found = salesSeries.find(r => r.period === ds);
    return {
      label: `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]}`,
      sales: found?.revenue ?? 0,
      profit: found?.profit ?? 0,
    };
  });

  const donutData = topProducts.slice(0, 5).filter(p => p.qty_sold > 0).map(p => ({ label: p.name, value: p.qty_sold }));

  const handleExport = () => exportCSV(
    `dashboard-${today}.csv`,
    ['Tanggal', 'Penjualan', 'Profit'],
    last7.map(d => [d.label, d.sales, d.profit])
  );

  const Skeleton = () => (
    <div style={{ flex: 1, minWidth: 160, height: 88, background: '#F0F0F0', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
  );

  return (
    <div style={{ padding: 'var(--page-pad)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Topbar
        title="Dashboard"
        subtitle={`Selamat datang kembali, Wicky — ${new Date(today + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        actions={
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            <Icon name="download" size={14} color="white" />
            Export CSV
          </button>
        }
      />

      {/* Stat Cards */}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {loadingReport ? [1,2,3,4,5].map(i => <Skeleton key={i} />) : <>
          <StatCard label="Total Penjualan"  value={fmt(totalSales)}          sub={trendLabel(salesPct)}  trend={trendDir(salesPct)}  icon="cart"        color="blue" />
          <StatCard label="Total Profit"      value={fmt(totalProfit)}         sub={trendLabel(profitPct)} trend={trendDir(profitPct)} icon="trending_up"  color="green" />
          <StatCard label="Margin Rata-rata"  value={`${avgMargin}%`}          sub={avgMargin >= 30 ? 'Margin sehat 💪' : 'Di bawah target 30%'} trend={avgMargin >= 30 ? 'up' : 'down'} icon="laporan" color="orange" />
          <StatCard label="Total Transaksi"   value={totalTx}                  sub={trendLabel(txPct)}     trend={trendDir(txPct)}     icon="pesanan"      color="purple" />
          <StatCard label="Stok Menipis"      value={`${lowStock.length} Produk`} sub={lowStock.length > 0 ? 'Perlu restock segera' : 'Semua stok aman ✓'} trend={lowStock.length > 0 ? 'down' : undefined} icon="warning" color={lowStock.length > 0 ? 'red' : 'green'} />
        </>}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="chart-grid">
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Grafik Penjualan & Profit (7 Hari Terakhir)</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}><span style={{ width: 10, height: 3, background: '#3E3DE1', borderRadius: 2, display: 'inline-block' }}></span>Penjualan</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}><span style={{ width: 10, height: 3, background: '#22C55E', borderRadius: 2, display: 'inline-block' }}></span>Profit</span>
            </div>
          </div>
          {loadingReport
            ? <div style={{ height: 180, background: '#F9FAFB', borderRadius: 8 }} />
            : <LineChart salesData={last7.map(d => d.sales)} profitData={last7.map(d => d.profit)} labels={last7.map(d => d.label)} />}
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Top Produk Terjual (Hari Ini)</div>
          {!loadingReport && donutData.length > 0
            ? <DonutChart data={donutData} size={150} />
            : <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--text-secondary)', fontSize: 13 }}>{loadingReport ? 'Memuat...' : 'Belum ada transaksi hari ini'}</div>}
        </div>
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="tables-grid">
        {/* Stock Table */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Produk – Stok Terkini</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                {['Produk', 'Stok', 'Satuan', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0 8px 10px 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map(p => {
                const s = p.stock === 0 ? { label: 'Habis', type: 'danger' } : p.stock <= p.minStock ? { label: 'Menipis', type: 'warning' } : { label: 'Aman', type: 'success' };
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td style={{ padding: '10px 8px 10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{p.emoji}</div>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: p.stock === 0 ? 'var(--danger)' : p.stock <= p.minStock ? 'var(--warning)' : undefined }}>{p.stock}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{p.unit}</td>
                    <td style={{ padding: '10px 0' }}><Badge label={s.label} type={s.type} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top Products from API */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Top Produk – Profit Hari Ini</div>
          {topProducts.length === 0
            ? <div style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', paddingTop: 30 }}>{loadingReport ? 'Memuat...' : 'Belum ada transaksi hari ini'}</div>
            : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                    {['Produk', 'Terjual', 'Revenue', 'Profit'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0 6px 10px 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topProducts.slice(0, 5).map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      <td style={{ padding: '9px 6px 9px 0', fontWeight: 500 }}>{p.name}</td>
                      <td style={{ padding: '9px 6px', fontWeight: 700 }}>{p.qty_sold} pcs</td>
                      <td style={{ padding: '9px 6px' }}>{fmt(p.revenue)}</td>
                      <td style={{ padding: '9px 0', fontWeight: 600, color: '#15803D' }}>{fmt(p.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </div>
  );
};

// ─── KASIR PAGE ───────────────────────────────────────────────────────────────
const KasirPage = ({ products, onSale, isMobile }) => {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState('');
  const [success, setSuccess] = useState(null);
  const [category, setCategory] = useState('Semua');
  const [cartOpen, setCartOpen] = useState(false);

  const categories = ['Semua', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p =>
    (category === 'Semua' || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    if (product.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, modal: product.modal, qty: 1, emoji: product.emoji }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.productId === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const modalTotal = cart.reduce((s, i) => s + i.modal * i.qty, 0);
  const profit = total - modalTotal;
  const payAmt = parseInt(payment.replace(/\D/g, '')) || 0;
  const change = payAmt - total;

  const handleCheckout = () => {
    if (cart.length === 0 || payAmt < total) return;
    onSale({ items: cart.map(i => ({ productId: i.productId, name: i.name, price: i.price, modal: i.modal, qty: i.qty })), total, modalTotal, payment: payAmt, change });
    setSuccess({ total, change, items: cart });
    setCart([]);
    setPayment('');
  };

  const quickAmounts = [5000, 10000, 20000, 50000].filter(a => a >= total).slice(0, 4);

  if (success) {
    return (
      <div style={{ padding: '40px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="check" size={28} color="var(--success)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Transaksi Berhasil!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Pembayaran telah diterima</p>
          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left' }}>
            {success.items.map((i, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{i.emoji} {i.name} ×{i.qty}</span>
                <span style={{ fontWeight: 600 }}>{fmt(i.price * i.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
              <span>Total</span><span>{fmt(success.total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>
              <span>Kembalian</span><span>{fmt(success.change)}</span>
            </div>
          </div>
          <button onClick={() => setSuccess(null)} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
            Transaksi Baru
          </button>
        </div>
      </div>
    );
  }


  // ── shared cart panel contents ───────────────────────────────────────────
  const CartContents = () => (
    <>
      <div style={{ flex:1, overflowY:'auto', padding:'10px 0' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-secondary)' }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🛒</div>
            <div style={{ fontSize:13 }}>Keranjang masih kosong</div>
          </div>
        ) : cart.map(item => (
          <div key={item.productId} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', borderBottom:'1px solid #F9FAFB' }}>
            <span style={{ fontSize:22 }}>{item.emoji}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{fmt(item.price)}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <button onClick={() => updateQty(item.productId, -1)} style={{ width:32, height:32, borderRadius:'50%', border:'1.5px solid var(--border)', background:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <Icon name="minus" size={13} color="#374151" />
              </button>
              <span style={{ fontSize:14, fontWeight:700, minWidth:20, textAlign:'center' }}>{item.qty}</span>
              <button onClick={() => updateQty(item.productId, 1)} style={{ width:32, height:32, borderRadius:'50%', border:'none', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <Icon name="plus" size={13} color="white" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:'14px 18px', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-secondary)' }}>
          <span>Modal</span><span>{fmt(modalTotal)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--success)', fontWeight:600 }}>
          <span>Profit</span><span>{fmt(profit)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:800, fontFamily:'var(--font-display)', borderTop:'1px solid var(--border)', paddingTop:10 }}>
          <span>Total</span><span style={{ color:'var(--primary)' }}>{fmt(total)}</span>
        </div>
        {cart.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {[total, total + 2500, Math.ceil(total/5000)*5000, Math.ceil(total/10000)*10000].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4).map(a => (
              <button key={a} onClick={() => setPayment(String(a))} style={{ flex:1, padding:'6px 0', borderRadius:7, border:'1.5px solid var(--border)', background:parseInt(payment.replace(/\D/g,''))===a?'var(--primary-light)':'white', color:parseInt(payment.replace(/\D/g,''))===a?'var(--primary)':'var(--text-secondary)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)' }}>
                {fmt(a)}
              </button>
            ))}
          </div>
        )}
        <input value={payment} onChange={e=>setPayment(e.target.value.replace(/\D/g,''))} placeholder="Nominal bayar"
          style={{ padding:'11px 12px', borderRadius:9, border:'1.5px solid var(--border)', fontSize:14, fontWeight:700, textAlign:'right', outline:'none', fontFamily:'var(--font-display)', color:'var(--text-primary)' }} />
        {payAmt >= total && total > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--success)', fontWeight:700 }}>
            <span>Kembalian</span><span>{fmt(change)}</span>
          </div>
        )}
        <button onClick={handleCheckout} disabled={cart.length===0||payAmt<total}
          style={{ width:'100%', padding:'14px', borderRadius:10, border:'none', background:cart.length>0&&payAmt>=total?'var(--primary)':'#E5E7EB', color:cart.length>0&&payAmt>=total?'white':'#9CA3AF', fontWeight:700, fontSize:15, cursor:cart.length>0&&payAmt>=total?'pointer':'not-allowed', fontFamily:'var(--font-display)', transition:'all 0.15s' }}>
          Bayar Sekarang
        </button>
      </div>
    </>
  );

  // ── product grid ─────────────────────────────────────────────────────────
  const ProductGrid = () => (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding: isMobile ? '16px 16px 80px' : '20px 16px 20px 28px', overflow:'hidden', height:'100%' }}>
      <div style={{ position:'relative', marginBottom:14 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari produk..."
          style={{ width:'100%', padding:'10px 12px 10px 38px', borderRadius:9, border:'1.5px solid var(--border)', fontSize:13.5, background:'white', outline:'none', fontFamily:'var(--font-body)' }} />
        <div style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
          <Icon name="search" size={15} color="#9CA3AF" />
        </div>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:14, overflowX:'auto', paddingBottom:2, flexShrink:0, WebkitOverflowScrolling:'touch' }}>
        {categories.map(c => (
          <button key={c} onClick={()=>setCategory(c)} style={{ padding:'6px 14px', borderRadius:99, border:'1.5px solid', borderColor:category===c?'var(--primary)':'var(--border)', background:category===c?'var(--primary-light)':'white', color:category===c?'var(--primary)':'var(--text-secondary)', fontSize:12.5, fontWeight:category===c?600:400, cursor:'pointer', fontFamily:'var(--font-body)', whiteSpace:'nowrap', flexShrink:0, transition:'all 0.15s' }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ overflowY:'auto', flex:1, display:'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(140px, 1fr))', gap:12, alignContent:'start' }}>
        {filtered.map(p => {
          const inCart = cart.find(i => i.productId === p.id);
          return (
            <button key={p.id} onClick={()=>addToCart(p)} style={{ background:'white', border:'1.5px solid', borderColor:inCart?'var(--primary)':'var(--border)', borderRadius:12, padding:'14px 12px', cursor:p.stock===0?'not-allowed':'pointer', opacity:p.stock===0?0.5:1, textAlign:'left', transition:'all 0.15s', boxShadow:inCart?'0 0 0 3px var(--primary-light)':'var(--shadow)', fontFamily:'var(--font-body)' }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{p.emoji}</div>
              <div style={{ fontWeight:600, fontSize:12.5, color:'var(--text-primary)', marginBottom:2 }}>{p.name}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--primary)', marginBottom:4 }}>{fmt(p.price)}</div>
              <div style={{ fontSize:11, color:p.stock<=5?'var(--danger)':'var(--text-secondary)' }}>Stok: {p.stock}</div>
              {inCart && <div style={{ marginTop:6, display:'inline-flex', alignItems:'center', justifyContent:'center', width:22, height:22, borderRadius:'50%', background:'var(--primary)', color:'white', fontSize:12, fontWeight:700 }}>{inCart.qty}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      <ProductGrid />

      {/* Desktop/Tablet: side cart panel */}
      {!isMobile && (
        <div style={{ width:300, background:'white', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', height:'100%', flexShrink:0 }}>
          <div style={{ padding:'18px 18px 12px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Icon name="cart" size={18} color="var(--primary)" />
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16 }}>Keranjang</span>
              {cart.length > 0 && <span style={{ marginLeft:'auto', background:'var(--primary)', color:'white', borderRadius:99, padding:'1px 8px', fontSize:12, fontWeight:700 }}>{cart.reduce((s,i)=>s+i.qty,0)}</span>}
            </div>
          </div>
          <CartContents />
        </div>
      )}

      {/* Mobile: floating cart button */}
      {isMobile && cart.length > 0 && (
        <button onClick={()=>setCartOpen(true)} style={{ position:'fixed', bottom:72, left:16, right:16, zIndex:150, background:'var(--primary)', color:'white', border:'none', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, boxShadow:'0 4px 20px rgba(62,61,225,0.35)', cursor:'pointer' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Icon name="cart" size={20} color="white" />
            <span>{cart.reduce((s,i)=>s+i.qty,0)} item</span>
          </div>
          <span>{fmt(total)}</span>
        </button>
      )}

      {/* Mobile: cart drawer */}
      {isMobile && cartOpen && (
        <div onClick={()=>setCartOpen(false)} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'flex-end' }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'100%', background:'white', borderRadius:'20px 20px 0 0', maxHeight:'88vh', display:'flex', flexDirection:'column', paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
            <div style={{ padding:'16px 18px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Icon name="cart" size={18} color="var(--primary)" />
                <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16 }}>Keranjang</span>
                <span style={{ background:'var(--primary)', color:'white', borderRadius:99, padding:'1px 8px', fontSize:12, fontWeight:700 }}>{cart.reduce((s,i)=>s+i.qty,0)}</span>
              </div>
              <button onClick={()=>setCartOpen(false)} style={{ background:'#F3F4F6', border:'none', borderRadius:99, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <Icon name="x" size={16} color="#6B7280" />
              </button>
            </div>
            <CartContents />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── STOK PAGE ────────────────────────────────────────────────────────────────
const StokPage = ({ products, onUpdateStock, isMobile }) => {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [addForm, setAddForm] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', price: '', modal: '', stock: '', minStock: '', unit: 'pcs', category: 'Risol', emoji: '🥐' });
  const [tab, setTab] = useState('all');

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || (tab === 'low' && p.stock <= p.minStock) || (tab === 'empty' && p.stock === 0);
    return matchSearch && matchTab;
  });

  const stockStatus = (p) => {
    if (p.stock === 0) return { label: 'Habis', type: 'danger' };
    if (p.stock <= p.minStock * 0.8) return { label: 'Menipis', type: 'warning' };
    return { label: 'Aman', type: 'success' };
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setEditVal({ stock: p.stock, price: p.price, modal: p.modal, minStock: p.minStock });
  };

  const saveEdit = (p) => {
    onUpdateStock(p.id, {
      stock: parseInt(editVal.stock) || 0,
      price: parseInt(editVal.price) || 0,
      modal: parseInt(editVal.modal) || 0,
      minStock: parseInt(editVal.minStock) || 0,
    });
    setEditing(null);
  };

  const lowCount = products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const emptyCount = products.filter(p => p.stock === 0).length;

  return (
    <div style={{ padding: 'var(--page-pad)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Topbar
        title="Manajemen Stok"
        subtitle="Kelola stok produk dan pengingat reorder"
        actions={<>
          <button onClick={() => setAddForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            <Icon name="plus" size={14} color="white" />
            Tambah Produk
          </button>
        </>}
      />

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 14 }}>
        <StatCard label="Total Produk" value={products.length} icon="produk" color="blue" />
        <StatCard label="Stok Normal" value={products.filter(p => p.stock > p.minStock).length} icon="check" color="green" />
        <StatCard label="Stok Menipis" value={lowCount} sub={lowCount > 0 ? 'Segera reorder' : undefined} trend={lowCount > 0 ? 'down' : undefined} icon="warning" color="orange" />
        <StatCard label="Stok Habis" value={emptyCount} sub={emptyCount > 0 ? 'Urgent!' : undefined} trend={emptyCount > 0 ? 'down' : undefined} icon="x" color="red" />
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
        {/* Filters */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} />
            <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <Icon name="search" size={14} color="#9CA3AF" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['all', 'Semua'], ['low', `Menipis (${lowCount})`], ['empty', `Habis (${emptyCount})`]].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)} style={{ padding: '6px 14px', borderRadius: 7, border: '1.5px solid', borderColor: tab === v ? 'var(--primary)' : 'var(--border)', background: tab === v ? 'var(--primary-light)' : 'white', color: tab === v ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 12.5, fontWeight: tab === v ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: card list */}
        {isMobile ? (
          <div style={{ padding:'0 16px 16px', display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map(p => {
              const s = stockStatus(p);
              const isEditing = editing === p.id;
              return (
                <div key={p.id} style={{ background:'white', border:'1.5px solid var(--border)', borderRadius:12, padding:'14px 16px', boxShadow:'var(--shadow)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                    <div style={{ width:44, height:44, borderRadius:10, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{p.emoji}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div>
                      <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{p.category}</div>
                    </div>
                    <Badge label={s.label} type={s.type} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
                    <div style={{ background:'#F9FAFB', borderRadius:8, padding:'8px 10px' }}>
                      <div style={{ fontSize:10, color:'var(--text-secondary)', marginBottom:2 }}>Harga Jual</div>
                      {isEditing ? <input type="number" value={editVal.price} onChange={e=>setEditVal(v=>({...v,price:e.target.value}))} style={{ width:'100%', padding:'4px 6px', borderRadius:6, border:'1.5px solid var(--primary)', fontSize:12, outline:'none' }} /> : <div style={{ fontSize:12, fontWeight:700 }}>{fmt(p.price)}</div>}
                    </div>
                    <div style={{ background:'#F9FAFB', borderRadius:8, padding:'8px 10px' }}>
                      <div style={{ fontSize:10, color:'var(--text-secondary)', marginBottom:2 }}>Stok</div>
                      {isEditing ? <input type="number" value={editVal.stock} onChange={e=>setEditVal(v=>({...v,stock:e.target.value}))} style={{ width:'100%', padding:'4px 6px', borderRadius:6, border:'1.5px solid var(--primary)', fontSize:12, fontWeight:700, outline:'none' }} /> : <div style={{ fontSize:14, fontWeight:800, color:p.stock===0?'var(--danger)':p.stock<=p.minStock?'var(--warning)':'var(--text-primary)' }}>{p.stock} <span style={{ fontSize:11, fontWeight:400, color:'var(--text-secondary)' }}>{p.unit}</span></div>}
                    </div>
                    <div style={{ background:'#F9FAFB', borderRadius:8, padding:'8px 10px' }}>
                      <div style={{ fontSize:10, color:'var(--text-secondary)', marginBottom:2 }}>Min Stok</div>
                      {isEditing ? <input type="number" value={editVal.minStock} onChange={e=>setEditVal(v=>({...v,minStock:e.target.value}))} style={{ width:'100%', padding:'4px 6px', borderRadius:6, border:'1.5px solid var(--border)', fontSize:12, outline:'none' }} /> : <div style={{ fontSize:12, fontWeight:600 }}>{p.minStock}</div>}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {isEditing ? (
                      <>
                        <button onClick={()=>saveEdit(p)} style={{ flex:1, padding:'9px', borderRadius:8, border:'none', background:'var(--primary)', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>Simpan</button>
                        <button onClick={()=>setEditing(null)} style={{ padding:'9px 16px', borderRadius:8, border:'1.5px solid var(--border)', background:'white', color:'var(--text-secondary)', fontSize:13, cursor:'pointer' }}>Batal</button>
                      </>
                    ) : (
                      <button onClick={()=>startEdit(p)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px', borderRadius:8, border:'1.5px solid var(--border)', background:'white', color:'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer' }}>
                        <Icon name="edit" size={14} />Edit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
        /* Desktop/Tablet: table */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1.5px solid var(--border)' }}>
                {['Produk', 'Kategori', 'Harga Jual', 'Modal', 'Min. Stok', 'Stok Saat Ini', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: 12, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const s = stockStatus(p);
                const isEditing = editing === p.id;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F9FAFB', background: isEditing ? '#FAFAFF' : 'transparent' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.emoji}</div>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{p.category}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {isEditing ? <input type="number" value={editVal.price} onChange={e => setEditVal(v => ({...v, price: e.target.value}))} style={{ width: 80, padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} /> : <span style={{ fontWeight: 600 }}>{fmt(p.price)}</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {isEditing ? <input type="number" value={editVal.modal} onChange={e => setEditVal(v => ({...v, modal: e.target.value}))} style={{ width: 80, padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} /> : fmt(p.modal)}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {isEditing ? <input type="number" value={editVal.minStock} onChange={e => setEditVal(v => ({...v, minStock: e.target.value}))} style={{ width: 60, padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} /> : p.minStock}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {isEditing ? (
                        <input type="number" value={editVal.stock} onChange={e => setEditVal(v => ({...v, stock: e.target.value}))} style={{ width: 70, padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--primary)', fontSize: 13, fontWeight: 700, outline: 'none', fontFamily: 'var(--font-body)' }} />
                      ) : (
                        <span style={{ fontWeight: 700, color: p.stock === 0 ? 'var(--danger)' : p.stock <= p.minStock ? 'var(--warning)' : 'var(--text-primary)' }}>
                          {p.stock} <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: 11 }}>{p.unit}</span>
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}><Badge label={s.label} type={s.type} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(p)} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Simpan</button>
                            <button onClick={() => setEditing(null)} style={{ padding: '5px 10px', borderRadius: 7, border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Batal</button>
                          </>
                        ) : (
                          <button onClick={() => startEdit(p)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                            <Icon name="edit" size={13} />Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Add Product Modal */}
      {addForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>Tambah Produk Baru</h3>
              <button onClick={() => setAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="#6B7280" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Nama Produk', key: 'name', type: 'text' },
                { label: 'Harga Jual', key: 'price', type: 'number' },
                { label: 'Modal (COGS)', key: 'modal', type: 'number' },
                { label: 'Stok Awal', key: 'stock', type: 'number' },
                { label: 'Minimum Stok', key: 'minStock', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type} value={newProd[f.key]} onChange={e => setNewProd(v => ({...v, [f.key]: e.target.value}))} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setAddForm(false)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Batal</button>
                <button onClick={() => { onUpdateStock('new', { ...newProd, price: parseInt(newProd.price), modal: parseInt(newProd.modal), stock: parseInt(newProd.stock), minStock: parseInt(newProd.minStock) }); setAddForm(false); setNewProd({ name: '', price: '', modal: '', stock: '', minStock: '', unit: 'pcs', category: 'Risol', emoji: '🥐' }); }} style={{ flex: 1, padding: '11px', borderRadius: 9, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── LAPORAN PAGE ─────────────────────────────────────────────────────────────
const LaporanPage = ({ products, isMobile }) => {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);
  const [subPage, setSubPage] = useState('ringkasan');

  const [summary, setSummary] = useState(null);
  const [prevSummary, setPrevSummary] = useState(null);
  const [salesSeries, setSalesSeries] = useState([]);
  const [profitData, setProfitData] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const daysDiff = Math.max(1, Math.round((new Date(to + 'T00:00:00') - new Date(from + 'T00:00:00')) / 86400000));
    const prevTo = new Date(new Date(from + 'T00:00:00') - 86400000).toISOString().slice(0, 10);
    const prevFrom = new Date(new Date(prevTo + 'T00:00:00') - (daysDiff - 1) * 86400000).toISOString().slice(0, 10);
    Promise.all([
      fetch(`${API_URL}/reports/summary?from=${from}&to=${to}`).then(r => r.json()),
      fetch(`${API_URL}/reports/summary?from=${prevFrom}&to=${prevTo}`).then(r => r.json()),
      fetch(`${API_URL}/reports/sales?from=${from}&to=${to}&group=day`).then(r => r.json()),
      fetch(`${API_URL}/reports/profit?from=${from}&to=${to}`).then(r => r.json()),
      fetch(`${API_URL}/reports/stock`).then(r => r.json()),
    ]).then(([s, ps, sales, profit, stock]) => {
      setSummary(s); setPrevSummary(ps);
      setSalesSeries(sales.data || []);
      setProfitData(profit); setStockData(stock);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  const pct = (curr, prev) => (prev > 0 ? ((curr - prev) / prev * 100).toFixed(1) : null);

  const totalSales   = summary?.revenue           ?? 0;
  const totalProfit  = summary?.profit            ?? 0;
  const totalTx      = summary?.transactionCount  ?? 0;
  const avgMargin    = summary?.margin            ?? 0;
  const lowStockList = summary?.lowStock          ?? [];

  const salesPct  = pct(totalSales,  prevSummary?.revenue          ?? 0);
  const profitPct = pct(totalProfit, prevSummary?.profit           ?? 0);
  const txPct     = pct(totalTx,     prevSummary?.transactionCount ?? 0);

  const trendSub = (p) => p !== null ? `${Number(p) >= 0 ? '↑' : '↓'} ${Math.abs(p)}% vs periode sebelumnya` : undefined;
  const trendDir = (p) => p !== null ? (Number(p) > 0 ? 'up' : 'down') : undefined;

  // Build complete day-by-day series (fill zeroes for missing days)
  const buildDays = () => {
    const result = [];
    const start = new Date(from + 'T00:00:00');
    const end   = new Date(to   + 'T00:00:00');
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().slice(0, 10);
      const found = salesSeries.find(r => r.period === ds);
      result.push({
        date: ds,
        label: `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]}`,
        sales:   found?.revenue           ?? 0,
        profit:  found?.profit            ?? 0,
        txCount: found?.transaction_count ?? 0,
      });
    }
    return result;
  };
  const days = buildDays();

  const handleExport = () => {
    if (!profitData?.byProduct) return;
    exportCSV(
      `laporan-risol-${from}-${to}.csv`,
      ['Produk', 'Kategori', 'Terjual', 'Revenue', 'COGS', 'Profit', 'Margin %'],
      profitData.byProduct.map(p => [p.name, p.category || '-', p.qty_sold, p.revenue, p.cogs, p.profit, (p.margin_pct ?? 0) + '%'])
    );
  };

  const subPages = [
    { id: 'ringkasan', label: 'Ringkasan' },
    { id: 'penjualan', label: 'Penjualan' },
    { id: 'profit',    label: 'Profit & Margin' },
    { id: 'stok',      label: 'Stok' },
  ];

  const EmptyRow = ({ cols, msg }) => (
    <tr><td colSpan={cols} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>{msg}</td></tr>
  );

  return (
    <div style={{ padding: 'var(--page-pad)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Topbar
        title="Laporan"
        subtitle="Ringkasan profit, penjualan dan stok"
        actions={<>
          <DateRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            <Icon name="download" size={14} color="white" />
            Export CSV
          </button>
        </>}
      />

      {/* Sub Nav */}
      <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: isMobile ? '100%' : 'fit-content', boxShadow: 'var(--shadow)', overflowX: isMobile ? 'auto' : 'visible' }}>
        {subPages.map(sp => (
          <button key={sp.id} onClick={() => setSubPage(sp.id)} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: subPage === sp.id ? 'var(--primary)' : 'transparent', color: subPage === sp.id ? 'white' : 'var(--text-secondary)', fontSize: 13, fontWeight: subPage === sp.id ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
            {sp.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        <StatCard label="Total Penjualan"  value={fmt(totalSales)}  sub={trendSub(salesPct)}  trend={trendDir(salesPct)}  icon="cart"       color="blue" />
        <StatCard label="Total Profit"      value={fmt(totalProfit)} sub={trendSub(profitPct)} trend={trendDir(profitPct)} icon="trending_up" color="green" />
        <StatCard label="Margin Rata-rata"  value={`${avgMargin}%`} sub={avgMargin >= 30 ? 'Margin sehat' : 'Di bawah target'} trend={avgMargin >= 30 ? 'up' : 'down'} icon="laporan" color="orange" />
        <StatCard label="Total Transaksi"   value={totalTx}          sub={trendSub(txPct)}     trend={trendDir(txPct)}     icon="pesanan"    color="purple" />
        <StatCard label="Stok Menipis"      value={`${lowStockList.length} Produk`} sub={lowStockList.length > 0 ? 'Perlu restock' : undefined} icon="warning" color="red" />
      </div>

      {/* ── RINGKASAN ── */}
      {subPage === 'ringkasan' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Grafik Penjualan & Profit</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}><span style={{ width: 10, height: 3, background: '#3E3DE1', borderRadius: 2, display: 'inline-block' }}></span>Penjualan</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}><span style={{ width: 10, height: 3, background: '#22C55E', borderRadius: 2, display: 'inline-block' }}></span>Profit</span>
              </div>
            </div>
            {loading
              ? <div style={{ height: 180, background: '#F9FAFB', borderRadius: 8 }} />
              : <LineChart salesData={days.map(d => d.sales)} profitData={days.map(d => d.profit)} labels={days.map(d => d.label)} />}
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Penjualan per Produk</div>
            {!loading && (summary?.topProducts ?? []).filter(p => p.qty_sold > 0).length > 0
              ? <DonutChart data={(summary?.topProducts ?? []).slice(0, 5).map(p => ({ label: p.name, value: p.qty_sold }))} size={150} />
              : <div style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>{loading ? 'Memuat...' : 'Belum ada data'}</div>}
          </div>
        </div>
      )}

      {/* ── PENJUALAN ── */}
      {subPage === 'penjualan' && (
        isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading
              ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>Memuat data...</div>
              : days.filter(d => d.txCount > 0).length === 0
                ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>Tidak ada transaksi dalam periode ini</div>
                : [...days].filter(d => d.txCount > 0).reverse().map(d => (
                  <div key={d.date} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{new Date(d.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{d.txCount} tx</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div><div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Penjualan</div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{fmt(d.sales)}</div></div>
                      <div><div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Profit</div><div style={{ fontSize: 14, fontWeight: 700, color: '#15803D' }}>{fmt(d.profit)}</div></div>
                    </div>
                  </div>
                ))
            }
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1.5px solid var(--border)' }}>
                  {['Tanggal', 'Penjualan', 'Profit', 'Transaksi'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <EmptyRow cols={4} msg="Memuat data..." />
                  : days.filter(d => d.txCount > 0).length === 0
                    ? <EmptyRow cols={4} msg="Tidak ada transaksi dalam periode ini" />
                    : [...days].filter(d => d.txCount > 0).reverse().map(d => (
                      <tr key={d.date} style={{ borderBottom: '1px solid #F9FAFB' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                          {new Date(d.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary)' }}>{fmt(d.sales)}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#15803D' }}>{fmt(d.profit)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{d.txCount} tx</span>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── PROFIT & MARGIN ── */}
      {subPage === 'profit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)', overflowX: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Profit per Kategori</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: isMobile ? 480 : undefined }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                  {['Kategori', 'Terjual', 'Revenue', 'COGS', 'Profit', 'Margin'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0 12px 10px 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <EmptyRow cols={6} msg="Memuat..." />
                  : (profitData?.byCategory ?? []).map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      <td style={{ padding: '11px 12px 11px 0', fontWeight: 600 }}>{c.category || '—'}</td>
                      <td style={{ padding: '11px 12px' }}>{c.qty_sold} pcs</td>
                      <td style={{ padding: '11px 12px', fontWeight: 600 }}>{fmt(c.revenue)}</td>
                      <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>{fmt(c.cogs)}</td>
                      <td style={{ padding: '11px 12px', fontWeight: 700, color: '#15803D' }}>{fmt(c.profit)}</td>
                      <td style={{ padding: '11px 0' }}><span style={{ color: 'var(--success)', fontWeight: 700 }}>{c.revenue > 0 ? Math.round((c.profit / c.revenue) * 100) : 0}%</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)', overflowX: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Profit per Produk</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: isMobile ? 560 : undefined }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                  {['Produk', 'Kategori', 'Terjual', 'Revenue', 'COGS', 'Profit', 'Margin'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0 10px 10px 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <EmptyRow cols={7} msg="Memuat..." />
                  : (profitData?.byProduct ?? []).map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      <td style={{ padding: '10px 10px 10px 0', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '10px 10px', color: 'var(--text-secondary)', fontSize: 12 }}>{p.category || '—'}</td>
                      <td style={{ padding: '10px 10px' }}>{p.qty_sold}</td>
                      <td style={{ padding: '10px 10px' }}>{fmt(p.revenue)}</td>
                      <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{fmt(p.cogs)}</td>
                      <td style={{ padding: '10px 10px', fontWeight: 700, color: '#15803D' }}>{fmt(p.profit)}</td>
                      <td style={{ padding: '10px 0' }}><span style={{ color: 'var(--success)', fontWeight: 700 }}>{p.margin_pct ?? 0}%</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── STOK ── */}
      {subPage === 'stok' && (
        isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading
              ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>Memuat data...</div>
              : (stockData?.products ?? products).map(p => {
                  const mov = (stockData?.movements ?? []).find(m => m.product_id === p.id);
                  const status = p.status || (p.stock === 0 ? 'empty' : p.stock <= (p.minStock ?? p.min_stock) ? 'low' : 'ok');
                  const badge = status === 'empty' ? { label: 'Habis', type: 'danger' } : status === 'low' ? { label: 'Menipis', type: 'warning' } : { label: 'Aman', type: 'success' };
                  return (
                    <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', boxShadow: 'var(--shadow)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.emoji}</div>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                        </div>
                        <Badge label={badge.label} type={badge.type} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Stok</div><div style={{ fontSize: 15, fontWeight: 800, color: p.stock === 0 ? 'var(--danger)' : p.stock <= (p.minStock ?? p.min_stock) ? 'var(--warning)' : 'var(--text-primary)' }}>{p.stock}</div></div>
                        <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Min</div><div style={{ fontSize: 15, fontWeight: 700 }}>{p.minStock ?? p.min_stock}</div></div>
                        <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Masuk</div><div style={{ fontSize: 13, fontWeight: 600, color: '#15803D' }}>{mov ? `+${mov.total_in}` : '—'}</div></div>
                        <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Keluar</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>{mov ? `-${mov.total_out}` : '—'}</div></div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1.5px solid var(--border)' }}>
                  {['Produk', 'Stok', 'Min. Stok', 'Status', 'Masuk (30 hari)', 'Keluar (30 hari)'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <EmptyRow cols={6} msg="Memuat data..." />
                  : (stockData?.products ?? products).map(p => {
                      const mov = (stockData?.movements ?? []).find(m => m.product_id === p.id);
                      const status = p.status || (p.stock === 0 ? 'empty' : p.stock <= (p.minStock ?? p.min_stock) ? 'low' : 'ok');
                      const badge = status === 'empty' ? { label: 'Habis', type: 'danger' } : status === 'low' ? { label: 'Menipis', type: 'warning' } : { label: 'Aman', type: 'success' };
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{p.emoji}</div>
                              <span style={{ fontWeight: 600 }}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: p.stock === 0 ? 'var(--danger)' : p.stock <= (p.minStock ?? p.min_stock) ? 'var(--warning)' : undefined }}>{p.stock}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{p.minStock ?? p.min_stock}</td>
                          <td style={{ padding: '12px 16px' }}><Badge label={badge.label} type={badge.type} /></td>
                          <td style={{ padding: '12px 16px', color: '#15803D', fontWeight: 600 }}>{mov ? `+${mov.total_in}` : '—'}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--danger)' }}>{mov ? `-${mov.total_out}` : '—'}</td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

// ─── PRODUK PAGE ──────────────────────────────────────────────────────────────
const ProdukPage = ({ products, transactions }) => {
  const prodPerf = products.map(p => {
    const items = transactions.flatMap(t => t.items).filter(i => i.productId === p.id);
    const revenue = items.reduce((s, i) => s + i.price * i.qty, 0);
    const cost = items.reduce((s, i) => s + i.modal * i.qty, 0);
    const qty = items.reduce((s, i) => s + i.qty, 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    return { ...p, revenue, cost, qty, profit, margin };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div style={{ padding: 'var(--page-pad)', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Topbar title="Produk" subtitle="Daftar produk dan performa penjualan" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {prodPerf.map(p => (
          <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)', transition: 'box-shadow 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F9FAFB', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{p.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)', marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.category}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)', marginTop: 4 }}>{fmt(p.price)}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Terjual</div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{p.qty}</div>
              </div>
              <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Stok</div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: p.stock === 0 ? 'var(--danger)' : p.stock <= p.minStock ? 'var(--warning)' : 'var(--text-primary)' }}>{p.stock}</div>
              </div>
              <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 3 }}>Revenue</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(p.revenue)}</div>
              </div>
              <div style={{ background: '#DCFCE7', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: '#15803D', marginBottom: 3 }}>Margin</div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--success)' }}>{p.margin}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── PLACEHOLDER PAGES ────────────────────────────────────────────────────────
const PlaceholderPage = ({ title, subtitle, icon }) => (
  <div style={{ padding: '40px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 18, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Icon name={icon} size={28} color="var(--primary)" />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{subtitle}</p>
    </div>
  </div>
);

// ─── TWEAKS PANEL ─────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#3E3DE1",
  "accentColor": "#E3F851",
  "sidebarWidth": 220,
  "compactMode": false,
  "darkSidebar": false
}/*EDITMODE-END*/;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const App = () => {
  const [page, setPage] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [toasts, addToast] = useToast();
  const { isMobile, isTablet } = useResponsive();

  const loadData = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const [prods, txs] = await Promise.all([
        fetch(`${API_URL}/products`).then(r => r.json()),
        fetch(`${API_URL}/transactions?from=${from}&to=${today}&limit=500`).then(r => r.json()),
      ]);
      setProducts(prods);
      setTransactions(txs.map(normalizeTx));
    } catch (err) {
      setError('Tidak bisa terhubung ke server. Pastikan backend berjalan di port 3001.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSale = async (tx) => {
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: tx.items, payment: tx.payment }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Transaksi gagal');
      }
      const newTx = normalizeTx(await res.json());
      setTransactions(prev => [...prev, newTx]);
      const prods = await fetch(`${API_URL}/products`).then(r => r.json());
      setProducts(prods);
      addToast(`Transaksi #${newTx.id} berhasil disimpan`, 'success');
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan transaksi', 'error');
    }
  };

  const handleUpdateStock = async (id, updates) => {
    try {
      if (id === 'new') {
        const res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Gagal menambah produk');
        }
        const newProd = await res.json();
        setProducts(prev => [...prev, newProd]);
        addToast(`Produk "${newProd.name}" berhasil ditambahkan`, 'success');
      } else {
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Gagal update produk');
        }
        const updated = await res.json();
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
        addToast(`Produk "${updated.name}" berhasil diperbarui`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Gagal update produk', 'error');
    }
  };

  const dynStyle = [
    `:root {
      --primary: ${tweaks.primaryColor};
      --primary-light: ${tweaks.primaryColor}18;
      --primary-dark: ${tweaks.primaryColor}cc;
      --sidebar-w: ${tweaks.sidebarWidth}px;
      --page-pad: ${isMobile ? '16px 16px 80px' : '20px 28px 32px'};
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    @media (min-width: 768px) {
      .chart-grid  { grid-template-columns: 1fr 380px !important; }
      .tables-grid { grid-template-columns: 1fr 1fr !important; }
    }`,
    tweaks.darkSidebar ? `
    aside { background: #1A1A2E !important; border-right-color: #2D2D4A !important; }
    aside button { color: #94A3B8 !important; }
    aside button.active { color: white !important; }` : '',
    tweaks.compactMode ? `
    .stat-card { padding: 12px !important; }
    table td, table th { padding: 7px 12px !important; }` : '',
  ].join('\n');

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🥐</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Risol Teman</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Memuat data...</div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16, padding: 32 }}>
      <div style={{ fontSize: 36 }}>⚠️</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--danger)' }}>Koneksi Gagal</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 400 }}>{error}</div>
      <button onClick={() => { setError(null); setLoading(true); loadData(); }} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
        Coba Lagi
      </button>
    </div>
  );

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage products={products} isMobile={isMobile} />;
      case 'kasir':     return <KasirPage products={products} onSale={handleSale} isMobile={isMobile} />;
      case 'produk':    return <ProdukPage products={products} transactions={transactions} isMobile={isMobile} />;
      case 'stok':      return <StokPage products={products} onUpdateStock={handleUpdateStock} isMobile={isMobile} />;
      case 'laporan':   return <LaporanPage products={products} isMobile={isMobile} />;
      case 'pesanan':   return <PlaceholderPage title="Pesanan" subtitle="Kelola pesanan masuk di sini" icon="pesanan" />;
      case 'supplier':  return <PlaceholderPage title="Supplier" subtitle="Manajemen supplier & pembelian bahan baku" icon="supplier" />;
      case 'pengaturan':return <PlaceholderPage title="Pengaturan" subtitle="Konfigurasi toko dan akun" icon="settings" />;
      default:          return <DashboardPage products={products} />;
    }
  };

  return (
    <>
      <style>{dynStyle}</style>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {!isMobile && <Sidebar active={page} onNav={setPage} />}
        <main style={{ marginLeft: isMobile ? 0 : 'var(--sidebar-w)', flex: 1, overflowY: 'auto', background: 'var(--bg)', paddingBottom: isMobile ? 56 : 0 }}>
          {renderPage()}
        </main>
      </div>
      {isMobile && <BottomNav active={page} onNav={setPage} />}
      <TweaksPanel title="Tweaks" values={tweaks} set={setTweak}>
        <TweakSection title="Warna">
          <TweakColor label="Warna Utama" tweakKey="primaryColor" />
          <TweakColor label="Warna Aksen" tweakKey="accentColor" />
        </TweakSection>
        <TweakSection title="Layout">
          <TweakSlider label="Lebar Sidebar" tweakKey="sidebarWidth" min={180} max={280} step={10} />
          <TweakToggle label="Mode Compact" tweakKey="compactMode" />
          <TweakToggle label="Sidebar Gelap" tweakKey="darkSidebar" />
        </TweakSection>
      </TweaksPanel>
      <ToastContainer toasts={toasts} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
