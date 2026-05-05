import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode]       = useState('login');
  const [form, setForm]       = useState({ name:'', email:'', password:'', role:'Member' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, signup }     = useAuth();
  const navigate              = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Email aur password required hai.'); return; }
    if (mode === 'signup' && !form.name.trim()) { setError('Naam required hai.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await signup(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Kuch galat hua. Dobara try karo.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', fontFamily: "'Segoe UI',system-ui,sans-serif",
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Animated blobs */}
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%',
        background:'rgba(74,108,247,0.15)', top:-100, left:-100, filter:'blur(60px)' }} />
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%',
        background:'rgba(138,43,226,0.15)', bottom:-50, right:-50, filter:'blur(60px)' }} />
      <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%',
        background:'rgba(0,212,255,0.1)', top:'40%', right:'20%', filter:'blur(40px)' }} />

      {/* Left Panel — only on wide screens, hidden on small */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px', color:'#fff',
        '@media(maxWidth:768px)': { display:'none' }
      }}>
        <div style={{ fontSize:42, fontWeight:900, letterSpacing:'-1px', marginBottom:16 }}>
          Task<span style={{ color:'#4a6cf7' }}>Flow</span>
        </div>
        <p style={{ fontSize:18, color:'rgba(255,255,255,0.7)', maxWidth:380, lineHeight:1.7, marginBottom:40 }}>
          Apni team ke saath tasks manage karo — kabhi koi kaam miss na ho.
        </p>
        {[
          { icon:'🎯', text:'Role-based access (Admin / Member)' },
          { icon:'📊', text:'Real-time dashboard with stats' },
          { icon:'🗂️', text:'Kanban board per project' },
          { icon:'🔔', text:'Overdue task alerts' },
        ].map(f => (
          <div key={f.text} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'rgba(74,108,247,0.25)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
              {f.icon}
            </div>
            <span style={{ color:'rgba(255,255,255,0.8)', fontSize:15 }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Right Panel — Card */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'24px', width:'100%', maxWidth:500
      }}>
        <div style={{
          background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,0.15)', borderRadius:24,
          padding:'40px 44px', width:'100%',
          boxShadow:'0 25px 50px rgba(0,0,0,0.4)'
        }}>
          {/* Logo (mobile) */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:30, fontWeight:900, color:'#fff', letterSpacing:'-0.5px' }}>
              Task<span style={{ color:'#4a6cf7' }}>Flow</span>
            </div>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginTop:4 }}>
              {mode === 'login' ? 'Apne account mein login karo' : 'Naya account banao'}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.08)', borderRadius:12, padding:4, marginBottom:28 }}>
            {['login','signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex:1, padding:'10px 0', borderRadius:10, border:'none', cursor:'pointer',
                  fontWeight:700, fontSize:14, transition:'all .2s',
                  background: mode===m ? '#4a6cf7' : 'transparent',
                  color: mode===m ? '#fff' : 'rgba(255,255,255,0.5)',
                  boxShadow: mode===m ? '0 4px 15px rgba(74,108,247,0.4)' : 'none'
                }}
              >{m === 'login' ? '🔑 Login' : '✨ Sign Up'}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {mode === 'signup' && (
              <GlassInput label="👤 Full Name" placeholder="Arjun Sharma"
                value={form.name} onChange={e => set('name', e.target.value)} />
            )}
            <GlassInput label="📧 Email" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
            <div style={{ position:'relative' }}>
              <GlassInput label="🔒 Password" type={showPass ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={form.password} onChange={e => set('password', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()} />
              <button onClick={() => setShowPass(p => !p)}
                style={{ position:'absolute', right:14, bottom:12, background:'none', border:'none',
                  color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:16 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)', display:'block', marginBottom:8 }}>
                  🎭 Role
                </label>
                <div style={{ display:'flex', gap:10 }}>
                  {['Member','Admin'].map(r => (
                    <button key={r} onClick={() => set('role', r)}
                      style={{
                        flex:1, padding:'10px 0', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:13,
                        border: form.role===r ? '2px solid #4a6cf7' : '2px solid rgba(255,255,255,0.15)',
                        background: form.role===r ? 'rgba(74,108,247,0.3)' : 'rgba(255,255,255,0.05)',
                        color: form.role===r ? '#fff' : 'rgba(255,255,255,0.5)',
                      }}
                    >{r === 'Admin' ? '👑 Admin' : '👤 Member'}</button>
                  ))}
                </div>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:6 }}>
                  💡 Pehla user hamesha Admin banta hai automatically.
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'rgba(231,76,60,0.2)', border:'1px solid rgba(231,76,60,0.4)',
              color:'#ff8a80', borderRadius:10, padding:'12px 16px', fontSize:13, marginTop:16 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={submit} disabled={loading}
            style={{
              width:'100%', background: loading ? 'rgba(74,108,247,0.5)' : 'linear-gradient(135deg,#4a6cf7,#7c3aed)',
              color:'#fff', border:'none', borderRadius:12, padding:'14px 0',
              fontWeight:700, fontSize:16, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop:20, boxShadow: loading ? 'none' : '0 8px 25px rgba(74,108,247,0.4)',
              transition:'all .2s', letterSpacing:'0.3px'
            }}
          >
            {loading ? '⏳ Please wait…' : mode === 'login' ? 'Login karo →' : 'Account banao →'}
          </button>

          <p style={{ textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:20 }}>
            {mode === 'login' ? "Account nahi hai? " : "Account hai? "}
            <span onClick={() => { setMode(mode==='login'?'signup':'login'); setError(''); }}
              style={{ color:'#4a6cf7', cursor:'pointer', fontWeight:700 }}>
              {mode === 'login' ? 'Sign Up karo' : 'Login karo'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function GlassInput({ label, ...props }) {
  return (
    <div>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)', display:'block', marginBottom:7 }}>{label}</label>}
      <input
        style={{
          width:'100%', padding:'12px 14px', borderRadius:10,
          border:'1.5px solid rgba(255,255,255,0.15)',
          background:'rgba(255,255,255,0.08)', color:'#fff',
          fontSize:14, outline:'none', boxSizing:'border-box',
          backdropFilter:'blur(10px)',
          caretColor: '#4a6cf7',
          //ajay kushwaha
        }}
        {...props}
      />
      <style>{`input::placeholder { color: rgba(255,255,255,0.3); }`}</style>
    </div>
  );
}