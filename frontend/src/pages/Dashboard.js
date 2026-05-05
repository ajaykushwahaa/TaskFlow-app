import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, STATUS, PRIORITY, fmt, isOverdue, Spinner, Empty } from '../components/UI';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tasks/stats/dashboard'),
      api.get('/tasks/my')
    ]).then(([s, t]) => {
      setStats(s.data.stats);
      setTasks(t.data.tasks);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const STAT_CARDS = [
    { label:'Total Tasks',  val: stats?.all||0,        icon:'📋', g:'linear-gradient(135deg,#4a6cf7,#6a3de8)' },
    { label:'In Progress',  val: stats?.inProgress||0, icon:'⚡', g:'linear-gradient(135deg,#f093fb,#f5576c)' },
    { label:'Completed',    val: stats?.done||0,        icon:'✅', g:'linear-gradient(135deg,#4facfe,#00f2fe)' },
    { label:'Overdue',      val: stats?.overdue||0,     icon:'🔴', g:'linear-gradient(135deg,#fa709a,#fee140)' },
  ];

  const overdueTasks  = tasks.filter(t => isOverdue(t.dueDate, t.status));
  const recentTasks   = tasks.slice(0, 5);

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:6 }}>
          <Avatar user={user} size={48} />
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#1a1a2e' }}>
              {greeting}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ margin:0, color:'#888', fontSize:14 }}>
              {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{
            background:s.g, borderRadius:16, padding:'20px 22px',
            color:'#fff', boxShadow:'0 8px 25px rgba(0,0,0,0.12)',
            position:'relative', overflow:'hidden'
          }}>
            <div style={{ position:'absolute', right:-10, top:-10, fontSize:52, opacity:0.2 }}>{s.icon}</div>
            <div style={{ fontSize:32, fontWeight:900, marginBottom:4 }}>{s.val}</div>
            <div style={{ fontSize:13, opacity:0.9, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <div style={{
          background:'linear-gradient(135deg,rgba(231,76,60,0.1),rgba(192,57,43,0.05))',
          border:'1px solid rgba(231,76,60,0.25)', borderRadius:14,
          padding:'16px 20px', marginBottom:28,
          display:'flex', alignItems:'center', gap:14
        }}>
          <div style={{ fontSize:28 }}>⚠️</div>
          <div>
            <div style={{ fontWeight:700, color:'#c0392b', fontSize:15 }}>
              {overdueTasks.length} task{overdueTasks.length>1?'s':''} overdue hai!
            </div>
            <div style={{ color:'#888', fontSize:13, marginTop:2 }}>
              Inhe jaldi update karo.
            </div>
          </div>
          <button onClick={() => navigate('/tasks')}
            style={{ marginLeft:'auto', background:'#e74c3c', color:'#fff', border:'none',
              borderRadius:8, padding:'8px 16px', fontWeight:600, fontSize:13, cursor:'pointer' }}>
            Dekho →
          </button>
        </div>
      )}

      {/* Two column layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24 }}>
        {/* Recent Tasks */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#1a1a2e' }}>📋 Recent Tasks</h2>
            <button onClick={() => navigate('/tasks')}
              style={{ background:'none', border:'none', color:'#4a6cf7', fontWeight:600, fontSize:13, cursor:'pointer' }}>
              Sab dekho →
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {recentTasks.map(t => <TaskCard key={t._id} task={t} onClick={() => navigate('/tasks')} />)}
            {recentTasks.length === 0 && <Empty text="Koi task nahi hai abhi." />}
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div>
          <h2 style={{ margin:'0 0 16px', fontSize:17, fontWeight:700, color:'#1a1a2e' }}>📊 Progress</h2>
          <div style={{ background:'#fff', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,.06)' }}>
            {[
              { label:'To Do',       val: stats?.todo||0,       total: stats?.all||1, color:'#4a6cf7' },
              { label:'In Progress', val: stats?.inProgress||0, total: stats?.all||1, color:'#e6a817' },
              { label:'Done',        val: stats?.done||0,       total: stats?.all||1, color:'#27ae60' },
            ].map(p => (
              <div key={p.label} style={{ marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'#555' }}>{p.label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:p.color }}>{p.val}</span>
                </div>
                <div style={{ height:8, background:'#f0f0f0', borderRadius:99, overflow:'hidden' }}>
                  <div style={{
                    height:'100%', borderRadius:99, background:p.color,
                    width:`${(p.val/p.total)*100}%`, transition:'width .5s ease'
                  }} />
                </div>
              </div>
            ))}

            {stats?.all > 0 && (
              <div style={{ textAlign:'center', marginTop:8 }}>
                <div style={{ fontSize:28, fontWeight:900, color:'#1a1a2e' }}>
                  {Math.round(((stats?.done||0)/(stats?.all||1))*100)}%
                </div>
                <div style={{ fontSize:12, color:'#aaa' }}>Overall completion</div>
              </div>
            )}
          </div>

          {/* Profile card */}
          <div style={{ background:'linear-gradient(135deg,#4a6cf7,#7c3aed)', borderRadius:16, padding:20, marginTop:16, color:'#fff' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <Avatar user={user} size={44} />
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{user?.name}</div>
                <div style={{ fontSize:12, opacity:0.8 }}>{user?.email}</div>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:8, padding:'6px 12px', display:'inline-block', fontSize:12, fontWeight:700 }}>
              {user?.role === 'Admin' ? '👑 Admin' : '👤 Member'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }) {
  const sm = STATUS[task.status] || STATUS.todo;
  const pm = PRIORITY[task.priority] || PRIORITY.medium;
  const od = isOverdue(task.dueDate, task.status);
  return (
    <div onClick={onClick} style={{
      background:'#fff', borderRadius:12, padding:'14px 18px',
      display:'flex', alignItems:'center', gap:14, cursor:'pointer',
      boxShadow:'0 2px 8px rgba(0,0,0,.05)',
      borderLeft:`4px solid ${od ? '#e74c3c' : sm.color}`,
      transition:'transform .15s, box-shadow .15s'
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateX(4px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform='none'; }}
    >
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:600, fontSize:14, color:'#1a1a2e', marginBottom:4 }}>{task.title}</div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#aaa' }}>{task.project?.name}</span>
          <span style={{ fontSize:11, color: od?'#e74c3c':'#aaa' }}>· {fmt(task.dueDate)}</span>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
        <Badge text={sm.label} bg={sm.bg} color={sm.color} />
        <span style={{ fontSize:11, color:pm.color, fontWeight:600 }}>{pm.label}</span>
      </div>
      <Avatar user={task.assignee} size={32} />
    </div>
  );
}