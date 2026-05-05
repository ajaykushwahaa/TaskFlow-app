import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, STATUS, PRIORITY, fmt, isOverdue, Spinner } from '../components/UI';
import api from '../api/axios';

function AnimNum({ value }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const start = performance.now();
    const step = ts => {
      const p = Math.min((ts - start) / 900, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * ease));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display}</>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [vis, setVis]         = useState(false);

  useEffect(() => {
    Promise.all([api.get('/tasks/stats/dashboard'), api.get('/tasks/my')])
      .then(([s, t]) => { setStats(s.data.stats); setTasks(t.data.tasks); })
      .finally(() => { setLoading(false); setTimeout(() => setVis(true), 60); });
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:14 }}>
      <div style={{ width:40, height:40, border:'3px solid #e8eaf0', borderTop:'3px solid #6366f1', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
      <div style={{ color:'#aaa', fontSize:13 }}>Loading…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌤 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';
  const total    = stats?.all || 0;
  const donePct  = total ? Math.round(((stats?.done||0) / total) * 100) : 0;
  const overdue  = tasks.filter(t => isOverdue(t.dueDate, t.status));

  const CARDS = [
    { label:'Total Tasks',  val:stats?.all||0,        icon:'🗂',  a:'#6366f1', b:'#8b5cf6' },
    { label:'In Progress',  val:stats?.inProgress||0, icon:'⚡',  a:'#f59e0b', b:'#ef4444' },
    { label:'Completed',    val:stats?.done||0,        icon:'✅',  a:'#10b981', b:'#059669' },
    { label:'Overdue',      val:stats?.overdue||0,     icon:'🚨',  a:'#ef4444', b:'#dc2626' },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", paddingBottom:48 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .scard:hover{transform:translateY(-5px) scale(1.03)!important;box-shadow:0 24px 48px rgba(0,0,0,.18)!important;}
        .trow:hover{transform:translateX(5px)!important;box-shadow:0 6px 20px rgba(0,0,0,.09)!important;}
        .qa:hover{background:#f0f0ff!important;border-color:#6366f140!important;}
      `}</style>

      {/* ── Hero Banner ── */}
      <div style={{
        background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 55%,#4c1d95 100%)',
        borderRadius:22, padding:'28px 32px', marginBottom:26, color:'#fff',
        position:'relative', overflow:'hidden',
        opacity:vis?1:0, transform:vis?'none':'translateY(18px)', transition:'all .5s ease'
      }}>
        <div style={{ position:'absolute', right:-50, top:-50, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', right:80, bottom:-70, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />

        <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>
              {greeting}
            </div>
            <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1.2 }}>
              {user?.name?.split(' ')[0]} ka Dashboard{' '}
              <span style={{ background:'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                👋
              </span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:6 }}>
              {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
            </div>
          </div>

          {/* Donut progress */}
          <div style={{ position:'relative', width:86, height:86 }}>
            <svg width="86" height="86" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="43" cy="43" r="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"/>
              <circle cx="43" cy="43" r="36" fill="none"
                stroke="url(#pg)" strokeWidth="6"
                strokeDasharray={`${2*Math.PI*36}`}
                strokeDashoffset={`${2*Math.PI*36*(1-donePct/100)}`}
                strokeLinecap="round"
                style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1) 0.3s' }}
              />
              <defs>
                <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a78bfa"/>
                  <stop offset="100%" stopColor="#60a5fa"/>
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ fontSize:19, fontWeight:800 }}>{donePct}%</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.45)', letterSpacing:'0.5px' }}>DONE</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:26 }}>
        {CARDS.map((c, i) => (
          <div key={c.label} className="scard" style={{
            background:`linear-gradient(135deg,${c.a},${c.b})`,
            borderRadius:16, padding:'22px 20px', color:'#fff',
            boxShadow:`0 10px 28px ${c.a}45`, position:'relative', overflow:'hidden',
            transition:'all .25s ease', cursor:'default',
            opacity:vis?1:0, transform:vis?'none':'translateY(20px)',
            transitionDelay:`${i*70}ms`
          }}>
            <div style={{ position:'absolute', right:-14, top:-14, width:72, height:72, borderRadius:'50%', background:'rgba(255,255,255,0.12)' }} />
            <div style={{ fontSize:22, marginBottom:6, position:'relative' }}>{c.icon}</div>
            <div style={{ fontSize:38, fontWeight:900, lineHeight:1, position:'relative' }}>
              <AnimNum value={c.val} />
            </div>
            <div style={{ fontSize:11, opacity:0.8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', marginTop:5 }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Overdue Alert ── */}
      {overdue.length > 0 && (
        <div style={{
          background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)',
          borderRadius:14, padding:'14px 20px', marginBottom:24,
          display:'flex', alignItems:'center', gap:14,
          opacity:vis?1:0, transition:'opacity .5s ease .45s'
        }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'rgba(239,68,68,0.15)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>⚠️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:'#dc2626', fontSize:14 }}>
              {overdue.length} overdue task{overdue.length>1?'s':''} hain!
            </div>
            <div style={{ color:'#ef4444', fontSize:12, opacity:0.65, marginTop:2 }}>
              Jaldi update karo
            </div>
          </div>
          <button onClick={() => navigate('/tasks')} style={{
            background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff',
            border:'none', borderRadius:8, padding:'8px 18px',
            fontWeight:700, fontSize:12, cursor:'pointer',
            boxShadow:'0 4px 12px rgba(239,68,68,0.35)'
          }}>Fix Now →</button>
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:22 }}>

        {/* Tasks list */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:16, fontWeight:800, color:'#1a1a2e' }}>Recent Tasks</div>
            <button className="qa" onClick={() => navigate('/tasks')} style={{
              background:'none', border:'1px solid #e8eaf0', color:'#888',
              borderRadius:8, padding:'6px 14px', fontWeight:600, fontSize:12,
              cursor:'pointer', transition:'all .15s'
            }}>Sab dekho →</button>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {tasks.slice(0,6).map((t, i) => {
              const sm = STATUS[t.status]||STATUS.todo;
              const pm = PRIORITY[t.priority]||PRIORITY.medium;
              const od = isOverdue(t.dueDate, t.status);
              return (
                <div key={t._id} className="trow" onClick={() => navigate('/tasks')} style={{
                  background:'#fff', borderRadius:12, padding:'13px 16px',
                  display:'flex', alignItems:'center', gap:12, cursor:'pointer',
                  border:'1px solid #f0f2f8',
                  borderLeft:`4px solid ${od?'#ef4444':sm.color}`,
                  boxShadow:'0 2px 6px rgba(0,0,0,.04)',
                  transition:'all .2s ease',
                  opacity:vis?1:0, transitionDelay:`${300+i*55}ms`
                }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'#1a1a2e', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize:11, color:'#bbb' }}>
                      {t.project?.name} · <span style={{ color:od?'#ef4444':'#bbb' }}>{fmt(t.dueDate)}</span>
                    </div>
                  </div>
                  <span style={{ background:sm.bg, color:sm.color, borderRadius:20, padding:'2px 9px', fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
                    {sm.label}
                  </span>
                  <span style={{ fontSize:11, color:pm.color, fontWeight:700, minWidth:36, textAlign:'right' }}>
                    {pm.label}
                  </span>
                  <Avatar user={t.assignee} size={28} />
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div style={{ background:'#fff', borderRadius:12, padding:'36px 20px', textAlign:'center', border:'1px solid #f0f0f0' }}>
                <div style={{ fontSize:30, marginBottom:8 }}>📭</div>
                <div style={{ color:'#bbb', fontSize:13 }}>Koi task nahi hai abhi</div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Profile */}
          <div style={{
            background:'linear-gradient(135deg,#1e1b4b,#312e81)',
            borderRadius:16, padding:20, color:'#fff',
            opacity:vis?1:0, transition:'opacity .5s ease .38s'
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:user?.color||'#6366f1',
                display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:17 }}>
                {user?.avatar}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{user?.name}</div>
                <div style={{ fontSize:11, opacity:0.4, marginTop:1 }}>{user?.email}</div>
              </div>
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6,
              background:'rgba(255,255,255,0.12)', borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:700 }}>
              {user?.role==='Admin'?'👑':'👤'} {user?.role}
            </div>
          </div>

          {/* Progress bars */}
          <div style={{
            background:'#fff', borderRadius:16, padding:'18px 20px',
            border:'1px solid #f0f2f8',
            opacity:vis?1:0, transition:'opacity .5s ease .48s'
          }}>
            <div style={{ fontSize:14, fontWeight:800, color:'#1a1a2e', marginBottom:16 }}>📊 Progress</div>
            {[
              {label:'To Do',       val:stats?.todo||0,       color:'#6366f1'},
              {label:'In Progress', val:stats?.inProgress||0, color:'#f59e0b'},
              {label:'Done',        val:stats?.done||0,        color:'#10b981'},
            ].map(p => {
              const pct = total ? Math.round((p.val/total)*100) : 0;
              return (
                <div key={p.label} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#666' }}>{p.label}</span>
                    <span style={{ fontSize:12, fontWeight:800, color:p.color }}>{p.val}</span>
                  </div>
                  <div style={{ height:7, background:'#f4f4f8', borderRadius:99, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', borderRadius:99, background:p.color,
                      width:vis?`${pct}%`:'0%',
                      transition:'width 1.1s cubic-bezier(0.34,1.56,0.64,1)',
                      transitionDelay:'0.55s'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div style={{
            background:'#fff', borderRadius:16, padding:'18px 20px',
            border:'1px solid #f0f2f8',
            opacity:vis?1:0, transition:'opacity .5s ease .56s'
          }}>
            <div style={{ fontSize:14, fontWeight:800, color:'#1a1a2e', marginBottom:12 }}>⚡ Quick Actions</div>
            {[
              {icon:'📋', label:'Tasks dekho',      path:'/tasks',    color:'#6366f1'},
              {icon:'📁', label:'Projects dekho',   path:'/projects', color:'#10b981'},
              {icon:'👥', label:'Team manage karo', path:'/team',     color:'#f59e0b'},
            ].map(a => (
              <div key={a.path} className="qa" onClick={() => navigate(a.path)} style={{
                display:'flex', alignItems:'center', gap:10, padding:'9px 11px',
                borderRadius:9, cursor:'pointer', marginBottom:7,
                background:'#fafafa', border:'1px solid #f0f0f0', transition:'all .15s'
              }}>
                <div style={{ width:30, height:30, borderRadius:8, background:a.color+'15',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{a.icon}</div>
                <span style={{ fontSize:12, fontWeight:600, color:'#444' }}>{a.label}</span>
                <span style={{ marginLeft:'auto', color:'#ccc' }}>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}