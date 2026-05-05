import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI';

const NAV = [
  { path:'/dashboard', icon:'📊', label:'Dashboard' },
  { path:'/projects',  icon:'📁', label:'Projects' },
  { path:'/tasks',     icon:'📋', label:'My Tasks' },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const active    = location.pathname;
  const [hover, setHover] = useState(null);

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:"'DM Sans',system-ui,sans-serif", background:'#f4f6fb' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap');
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#f0f0f0} ::-webkit-scrollbar-thumb{background:#ccc;border-radius:99px}
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width:230, flexShrink:0,
        background:'linear-gradient(180deg,#1e1b4b 0%,#1a1040 60%,#0f0a2e 100%)',
        display:'flex', flexDirection:'column',
        position:'sticky', top:0, height:'100vh',
        boxShadow:'4px 0 24px rgba(0,0,0,0.15)'
      }}>
        {/* Logo */}
        <div style={{ padding:'28px 24px 20px' }}>
          <div style={{ fontSize:22, fontWeight:900, color:'#fff', letterSpacing:'-0.5px' }}>
            Task<span style={{ color:'#818cf8' }}>Flow</span>
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:3, letterSpacing:'0.5px' }}>
            TEAM TASK MANAGER
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'0 24px 16px' }} />

        {/* Nav */}
        <nav style={{ flex:1, padding:'0 12px' }}>
          {[...NAV, ...(isAdmin ? [{path:'/team',icon:'👥',label:'Team'}] : [])].map(({ path, icon, label }) => {
            const isActive = active.startsWith(path);
            return (
              <div key={path}
                onClick={() => navigate(path)}
                onMouseEnter={() => setHover(path)}
                onMouseLeave={() => setHover(null)}
                style={{
                  display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
                  borderRadius:11, marginBottom:4, cursor:'pointer',
                  transition:'all .2s ease', userSelect:'none',
                  background: isActive
                    ? 'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(139,92,246,0.2))'
                    : hover===path ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: isActive ? '1px solid rgba(129,140,248,0.3)' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(99,102,241,0.2)' : 'none',
                }}>
                <div style={{
                  width:34, height:34, borderRadius:9,
                  background: isActive ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.06)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:16, transition:'all .2s',
                  boxShadow: isActive ? '0 2px 8px rgba(129,140,248,0.3)' : 'none'
                }}>{icon}</div>
                <span style={{
                  fontSize:14, fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#c7d2fe' : 'rgba(255,255,255,0.5)',
                  transition:'color .2s'
                }}>{label}</span>
                {isActive && (
                  <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#818cf8' }} />
                )}
              </div>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'0 24px 16px' }} />

        {/* User section */}
        <div style={{ padding:'0 12px 20px' }}>
          <div style={{
            display:'flex', alignItems:'center', gap:10,
            background:'rgba(255,255,255,0.05)', borderRadius:12,
            padding:'10px 12px', border:'1px solid rgba(255,255,255,0.08)'
          }}>
            {/* Avatar */}
            <div style={{
              width:36, height:36, borderRadius:10,
              background:user?.color||'#6366f1',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:800, fontSize:14, color:'#fff', flexShrink:0
            }}>{user?.avatar}</div>

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.name}
              </div>
              <div style={{
                fontSize:10, fontWeight:600,
                color: user?.role==='Admin' ? '#fbbf24' : 'rgba(255,255,255,0.35)',
                display:'flex', alignItems:'center', gap:4, marginTop:1
              }}>
                {user?.role==='Admin'?'👑':'👤'} {user?.role}
              </div>
            </div>

            <button onClick={logout} title="Logout" style={{
              background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
              color:'rgba(255,255,255,0.4)', borderRadius:8, width:30, height:30,
              cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all .15s', flexShrink:0
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.25)'; e.currentTarget.style.color='#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.4)'; }}
            >↩</button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex:1, padding:'32px 36px', overflowY:'auto', minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  );
}