import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { api } from './api.js';
import './App.css';

function Protected({ children }) { const { user, loading } = useAuth(); if (loading) return <div className="loading"><div className="spinner"></div></div>; if (!user) return <Navigate to="/login" />; return children; }

function RoutesComp() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/campaigns/new" element={<Protected><CampaignEditor /></Protected>} />
      <Route path="/campaigns/:id" element={<Protected><CampaignEditor /></Protected>} />
      <Route path="/reviews/:id" element={<PublicReviews />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function Landing() {
  return <div className="landing"><nav className="nav"><div className="nb"><span className="nl">⭐</span><span className="nt">ReviewCollector</span></div><div className="nav-links"><a href="/login" className="btn btn-ghost">Sign In</a><a href="/signup" className="btn btn-primary">Get Started</a></div></nav><main className="lm"><div className="hero"><div className="hb">⭐ Collect reviews effortlessly</div><h1 className="ht">Reviews & NPS <span className="tg">for your website</span></h1><p className="hs">Embeddable widget to collect reviews and NPS scores. Display them anywhere.</p><div className="ha"><a href="/signup" className="btn btn-primary btn-lg">Start Free Trial</a></div></div><div className="features"><div className="fc"><div className="fi">🔌</div><h3>Easy Embed</h3><p>Add a script tag to your site. Widget appears automatically.</p></div><div className="fc"><div className="fi">⭐</div><h3>Star Reviews</h3><p>Collect 1-5 star ratings with written reviews.</p></div><div className="fc"><div className="fi">📊</div><h3>NPS Surveys</h3><p>Net Promoter Score (0-10) surveys included.</p></div><div className="fc"><div className="fi">✅</div><h3>Display Reviews</h3><p>Show approved reviews on a public page.</p></div></div><div className="ps"><div className="pc"><div className="ph"><h3>Pro</h3><div className="pa"><span className="pr">$29</span><span className="pe">/month</span></div></div><ul className="pf"><li>✅ Unlimited campaigns</li><li>✅ Star ratings + NPS</li><li>✅ Embeddable widget</li><li>✅ Review display page</li><li>✅ Response management</li></ul><a href="/signup" className="btn btn-primary btn-block">Start Free Trial</a></div></div><footer className="footer"><p>© 2025 ReviewCollector. Built by MicroSprint Studio.</p></footer></main></div>;
}

function LoginPage() {
  const [e,sE]=useState('');const[p,sP]=useState('');const[er,sEr]=useState('');const[ld,sL]=useState(false);
  const{login}=useAuth();const n=useNavigate();
  const h=async(ev)=>{ev.preventDefault();sEr('');sL(true);try{await login(e,p);n('/dashboard')}catch(err){sEr(err.message)}finally{sL(false)}};
  return <div className="auth-page"><div className="auth-card"><h2>Welcome back</h2><p>Sign in</p>{er&&<div style={{color:'var(--red)',marginBottom:16,fontSize:14}}>{er}</div>}<form onSubmit={h}><div className="fg"><label>Email</label><input className="input" type="email" value={e} onChange={e=>sE(e.target.value)} required/></div><div className="fg"><label>Password</label><input className="input" type="password" value={p} onChange={e=>sP(e.target.value)} required/></div><button className="btn btn-primary btn-block btn-lg" disabled={ld}>{ld?'...':'Sign In'}</button></form><div className="af">No account? <a href="/signup">Sign up</a></div></div></div>;
}

function SignupPage() {
  const[n,sN]=useState('');const[e,sE]=useState('');const[p,sP]=useState('');const[er,sEr]=useState('');const[ld,sL]=useState(false);
  const{signup}=useAuth();const nav=useNavigate();
  const h=async(ev)=>{ev.preventDefault();sEr('');sL(true);try{await signup(e,n,p);nav('/dashboard')}catch(err){sEr(err.message)}finally{sL(false)}};
  return <div className="auth-page"><div className="auth-card"><h2>Get started</h2><p>Create your account</p>{er&&<div style={{color:'var(--red)',marginBottom:16,fontSize:14}}>{er}</div>}<form onSubmit={h}><div className="fg"><label>Name</label><input className="input" value={n} onChange={e=>sN(e.target.value)} required/></div><div className="fg"><label>Email</label><input className="input" type="email" value={e} onChange={e=>sE(e.target.value)} required/></div><div className="fg"><label>Password</label><input className="input" type="password" value={p} onChange={e=>sP(e.target.value)} minLength={6} required/></div><button className="btn btn-primary btn-block btn-lg" disabled={ld}>{ld?'...':'Create Account'}</button></form><div className="af">Have an account? <a href="/login">Sign in</a></div></div></div>;
}

function Dashboard() {
  const{user,logout}=useAuth();const nav=useNavigate();
  const[cs,sCs]=useState([]);const[ld,sL]=useState(true);
  useEffect(()=>{api.campaigns.list().then(d=>sCs(d.campaigns)).catch(console.error).finally(()=>sL(false))},[]);
  return <div><nav className="nav"><div className="nb"><span className="nl">⭐</span><span className="nt">ReviewCollector</span></div><div className="nav-links"><span className="nu">{user?.name}</span><button className="btn btn-ghost btn-sm" onClick={logout}>Sign Out</button></div></nav><main className="mc"><div className="hr"><div><h1>Your Campaigns</h1><p className="sub">{cs.length} campaigns</p></div><button className="btn btn-primary" onClick={()=>nav('/campaigns/new')}>+ New Campaign</button></div>{ld?<div className="loader"><div className="spinner" style={{margin:'0 auto'}}></div></div>:cs.length===0?<div className="empty"><div style={{fontSize:48,marginBottom:16}}>⭐</div><h3>No campaigns yet</h3><p style={{marginBottom:24}}>Create your first review campaign.</p><button className="btn btn-primary" onClick={()=>nav('/campaigns/new')}>Create Campaign</button></div>:<div className="cg">{cs.map(c=><div key={c.id} className="card" onClick={()=>nav('/campaigns/'+c.id)}><div><h3>{c.name}</h3><p style={{fontSize:13,color:'var(--text-muted)'}}>{c.widget_type==='nps'?'NPS':'Reviews'} · {c.response_count} responses{c.avg_rating?` · ${parseFloat(c.avg_rating).toFixed(1)} avg`:''}</p></div><span className="badge" style={{background:'var(--primary-glow)',color:'var(--primary)'}}>{c.response_count}</span></div>)}</div>}</main></div>;
}

function CampaignEditor() {
  const{id}=useParams();const nav=useNavigate();const{user}=useAuth();
  const[name,sN]=useState('');const[wt,sW]=useState('review');const[pt,sP]=useState('How was your experience?');const[ac,sA]=useState('#6366f1');const[pos,sPo]=useState('bottom-right');const[ss,sSs]=useState(1);
  const[ld,sL]=useState(false);const[saving,sS]=useState(false);const[responses,sR]=useState([]);const[campaign,sCa]=useState(null);
  useEffect(()=>{if(id){sL(true);api.campaigns.get(id).then(d=>{const c=d.campaign;sN(c.name);sW(c.widget_type);sP(c.prompt_text);sA(c.accent_color);sPo(c.position);sSs(c.show_stars);sR(c.responses||[]);sCa(c);}).catch(()=>nav('/dashboard')).finally(()=>sL(false))}},[id]);
  const save=async()=>{if(!name.trim())return;sS(true);try{if(id)await api.campaigns.update(id,{name,widget_type:wt,prompt_text:pt,accent_color:ac,position:pos,show_stars:ss});else await api.campaigns.create({name,widget_type:wt,prompt_text:pt,accent_color:ac,position:pos,show_stars:ss});nav('/dashboard')}catch(err){alert(err.message)}finally{sS(false)}};
  const handleDelete=async(rid)=>{if(!confirm('Delete this response?'))return;try{await api.campaigns.deleteResponse(id,rid);sR(responses.filter(r=>r.id!==rid))}catch(err){alert(err.message)}};
  const handleApprove=async(rid)=>{try{await api.campaigns.approve(id,rid);sR(responses.map(r=>r.id===rid?{...r,approved:1}:r))}catch(err){alert(err.message)}};
  if(ld)return <div className="loading"><div className="spinner"></div></div>;
  const embedUrl = campaign ? `${window.location.origin}/widget/embed.js` : '';
  const embedCode = campaign ? `<script src="${window.location.origin}/widget/embed.js" data-campaign="${campaign.id}" data-api="${window.location.origin}"></script>\n<script>document.currentScript.dataset.campaign='${campaign.id}';document.currentScript.dataset.api='${window.location.origin}';</script>` : '<script src="YOUR_URL/widget/embed.js" data-campaign="CAMPAIGN_ID" data-api="YOUR_URL"></script>';
  return <div><nav className="nav"><div className="nb"><span className="nl">⭐</span><span className="nt">ReviewCollector</span></div><div className="nav-links"><button className="btn btn-ghost btn-sm" onClick={()=>nav('/dashboard')}>← Dashboard</button><span className="nu">{user?.name}</span></div></nav><main className="mc" style={{maxWidth:700}}><h1 style={{marginBottom:24}}>{id?'Campaign Details':'New Campaign'}</h1><div className="ec"><div className="fg"><label>Name</label><input className="input" value={name} onChange={e=>sN(e.target.value)} placeholder="e.g. Website Feedback"/></div><div className="fg"><label>Widget Type</label><select className="input" value={wt} onChange={e=>sW(e.target.value)}><option value="review">Star Rating + Review</option><option value="nps">NPS Survey (0-10)</option></select></div><div className="fg"><label>Prompt Text</label><input className="input" value={pt} onChange={e=>sP(e.target.value)} placeholder="How was your experience?"/></div><div className="fg"><label>Accent Color</label><input className="input" type="color" value={ac} onChange={e=>sA(e.target.value)} style={{height:48,padding:4}}/></div><div className="fg"><label>Widget Position</label><select className="input" value={pos} onChange={e=>sPo(e.target.value)}><option value="bottom-right">Bottom Right</option><option value="bottom-left">Bottom Left</option><option value="top-right">Top Right</option><option value="top-left">Top Left</option></select></div><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save Campaign'}</button></div>
{id && campaign && <div className="ec" style={{marginTop:24}}><h3>Embed Code</h3><p style={{fontSize:14,color:'var(--text-muted)',marginBottom:8}}>Add this to your website's HTML:</p><textarea className="input" style={{minHeight:100,fontFamily:'monospace',fontSize:12}} readOnly value={embedCode} onClick={e=>e.target.select()}/></div>}
{id && <div style={{marginTop:24}}><h2>Responses ({responses.length})</h2><div className="cg">{responses.map(r=><div key={r.id} className="card" style={{cursor:'default',flexDirection:'column',alignItems:'stretch'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><div>{r.rating?'⭐'.repeat(r.rating):r.nps_score!==null?`NPS: ${r.nps_score}/10`:''}<span style={{marginLeft:8,fontSize:13,color:'var(--text-muted)'}}>{r.respondent_name||r.respondent_email||'Anonymous'}</span></div><span className={`badge ${r.applied?'badge-signed':'badge-draft'}`}>{r.approved?'Approved':'Pending'}</span></div>{r.review_text&&<p style={{fontSize:14,color:'var(--text-muted)',marginBottom:8}}>{r.review_text}</p>}<div style={{display:'flex',gap:8}}>{!r.approved&&<button className="btn btn-success btn-sm" onClick={()=>handleApprove(r.id)}>Approve</button>}<button className="btn btn-danger btn-sm" onClick={()=>handleDelete(r.id)}>Delete</button></div></div>)}</div></div>}
</main></div>;
}

function PublicReviews() {
  const{id}=useParams();const[data,sD]=useState(null);const[ld,sL]=useState(true);const[er,sE]=useState(null);
  useEffect(()=>{api.public.reviews(id).then(d=>sD(d)).catch(e=>sE(e.message)).finally(()=>sL(false))},[id]);
  if(ld)return <div className="loading"><div className="spinner"></div></div>;
  if(er||!data)return <div className="wp"><div className="we"><h2>Not found</h2></div></div>;
  return <div className="wp"><div className="wc"><h1 style={{marginBottom:16}}>{data.campaign?.name||'Reviews'}</h1>{data.stats?.count>0&&<p style={{marginBottom:24,color:'var(--text-muted)'}}>{data.stats.count} reviews · {parseFloat(data.stats.avg_rating||0).toFixed(1)} average</p>}{data.responses.length===0?<p style={{color:'var(--text-muted)'}}>No reviews yet.</p>:<div className="cg">{data.responses.map(r=><div key={r.id} className="card" style={{cursor:'default',flexDirection:'column',alignItems:'stretch'}}><div style={{marginBottom:4}}>{r.rating?'⭐'.repeat(r.rating):r.nps_score!==null?`NPS: ${r.nps_score}/10`:''}</div>{r.review_text&&<p style={{fontSize:14,color:'var(--text-muted)'}}>{r.review_text}</p>}<p style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>— {r.respondent_name||'Anonymous'}</p></div>)}</div>}</div></div>;
}

export default function App() { return <AuthProvider><RoutesComp /></AuthProvider>; }