import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData, getNominees, getAssets } from "../firebase/db";

function Icon({ d, size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.75" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const MODULES = [
  { path:"/vault",          label:"Vault",            sub:"Encrypted secrets",       d:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",                                                                                                          color:"#5B67F1", light:"#EEF0FD" },
  { path:"/nominees",       label:"Trusted Contacts", sub:"People who matter",       d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",    color:"#14B8A6", light:"#F0FDFA" },
  { path:"/documents",      label:"Documents",        sub:"Important files",         d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",                                                                                         color:"#8B5CF6", light:"#F5F3FF", badge:"New" },
  { path:"/udhaar",         label:"Udhaar Manager",   sub:"Loans & debts",           d:"M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",                                                         color:"#F59E0B", light:"#FFFBEB" },
  { path:"/subscriptions",  label:"Subscriptions",    sub:"Monthly spending",        d:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",                                                                                                    color:"#3B82F6", light:"#EFF6FF" },
  { path:"/bills",          label:"Utility Bills",     sub:"Your monthly bills",      d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",                                                                                         color:"#8B5CF6", light:"#F5F3FF", badge:"New" },
  { path:"/time-capsule",   label:"Time Capsule",     sub:"Future messages",         d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                                                                                                      color:"#EC4899", light:"#FDF2F8", badge:"New" },
  { path:"/emergency-card", label:"Emergency Card",   sub:"QR medical info",         d:"M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",                                                                                   color:"#EF4444", light:"#FEF2F2" },
  { path:"/ai-letter",      label:"AI Life Summary",  sub:"Your digital story",      d:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", color:"#6366F1", light:"#EEF2FF" },
  { path:"/legacy-trigger", label:"Legacy Trigger",   sub:"Configure legacy settings", d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",                                                                                                                                     color:"#8B5CF6", light:"#F5F3FF", badge:"New" }         
];

const CHECKLIST = [
  { label:"Add your first vault item",      path:"/vault",         cta:"Add item",    key:"vault" },
  { label:"Add a trusted contact",          path:"/nominees",      cta:"Add contact", key:"nominees" },
  { label:"Set up Emergency Card",          path:"/emergency-card",cta:"Set up",      key:"emergency" },
  { label:"Configure Legacy Trigger",       path:"/legacy-trigger", cta:"Configure",   key:"legacy" },
  { label:"Record an udhaar entry",         path:"/udhaar",        cta:"Add entry",   key:"udhaar" },
];

export default function Dashboard() {
  const [userData,  setUserData]  = useState(null);
  const [nominees,  setNominees]  = useState([]);
  const [assets,    setAssets]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    const [data, noms, ast] = await Promise.all([getUserData(), getNominees(), getAssets()]);
    if (data) setUserData(data);
    setNominees(noms || []);
    setAssets(ast || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const firstName = userData?.name?.split(" ")[0] || "there";
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const setupDone = assets.length > 0 && nominees.length > 0;

  if (loading) return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ marginBottom:"28px" }}>
        <div className="skeleton" style={{ height:"28px", width:"240px", marginBottom:"8px" }} />
        <div className="skeleton" style={{ height:"15px", width:"180px" }} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"24px" }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:"96px" }} />)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" }}>
        {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton" style={{ height:"120px" }} />)}
      </div>
    </div>
  );

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>

      {/* Header */}
      <div style={{ marginBottom:"28px" }}>
        <h1 style={{ fontSize:"22px", fontWeight:"700", color:"var(--text-1)", letterSpacing:"-0.02em", marginBottom:"4px" }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ fontSize:"14px", color:"var(--text-2)" }}>Here's what's going on in your digital life today.</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"12px", marginBottom:"28px" }}>
        {[
          { label:"Vault Items",      value: assets.length,    sub:"Encrypted",           color:"#5B67F1", light:"#EEF0FD", d:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
          { label:"Trusted Contacts", value: nominees.length,  sub:"Registered",          color:"#14B8A6", light:"#F0FDFA", d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
          { label:"Security",         value:"Protected",       sub:"AES-256",             color:"#22C55E", light:"#F0FDF4", d:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
          { label:"Account",          value:"Active",          sub: userData?.email?.split("@")[0] || "—", color:"#8B5CF6", light:"#F5F3FF", d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        ].map((s, i) => (
          <div key={i} style={S.statCard}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
              <div style={{ width:"34px", height:"34px", borderRadius:"var(--radius)", background:s.light, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon d={s.d} size={15} color={s.color} />
              </div>
            </div>
            <p style={{ fontSize:"22px", fontWeight:"700", color:"var(--text-1)", letterSpacing:"-0.02em", marginBottom:"2px" }}>{s.value}</p>
            <p style={{ fontSize:"12px", fontWeight:"500", color:"var(--text-2)" }}>{s.label}</p>
            <p style={{ fontSize:"11px", color:s.color, marginTop:"2px" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Modules grid */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
        <h2 style={{ fontSize:"14px", fontWeight:"600", color:"var(--text-1)" }}>Your modules</h2>
        <p style={{ fontSize:"12px", color:"var(--text-3)" }}>{MODULES.length} features</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:"10px", marginBottom:"32px" }}>
        {MODULES.map(({ path, label, sub, d, color, light, badge }) => (
          <div key={path} onClick={() => navigate(path)} style={S.moduleCard}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.borderColor = color + "50"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"12px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"var(--radius)", background:light, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon d={d} size={15} color={color} />
              </div>
              {badge && <span style={{ fontSize:"9px", padding:"2px 7px", borderRadius:"4px", background:light, color, fontWeight:"600", letterSpacing:"0.04em", border:`1px solid ${color}30` }}>{badge}</span>}
            </div>
            <p style={{ fontSize:"13px", fontWeight:"600", color:"var(--text-1)", marginBottom:"3px" }}>{label}</p>
            <p style={{ fontSize:"11px", color:"var(--text-3)", marginBottom:"10px" }}>{sub}</p>
            <p style={{ fontSize:"11px", color, fontWeight:"500" }}>Open →</p>
          </div>
        ))}
      </div>

      {/* Setup checklist */}
      {!setupDone && (
        <div style={S.checklistCard}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"var(--radius)", background:"var(--brand-light)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" size={15} color="var(--brand)" />
            </div>
            <div>
              <p style={{ fontSize:"13px", fontWeight:"600", color:"var(--text-1)" }}>Getting started</p>
              <p style={{ fontSize:"12px", color:"var(--text-3)" }}>Complete setup to get the most out of Final Handover</p>
            </div>
            <div style={{ marginLeft:"auto", fontSize:"12px", color:"var(--text-3)" }}>
              {CHECKLIST.filter((_, i) => [assets.length > 0, nominees.length > 0, false, false][i]).length}/{CHECKLIST.length}
            </div>
          </div>
          {CHECKLIST.map((step, i) => {
            const done = [assets.length > 0, nominees.length > 0, false, false][i];
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 12px", borderRadius:"var(--radius)", background: done ? "var(--success-bg)" : "var(--bg)", border:`1px solid ${done ? "#22C55E30" : "var(--border)"}`, marginBottom:"6px" }}>
                <div style={{ width:"18px", height:"18px", borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: done ? "#22C55E20" : "white", border:`1.5px solid ${done ? "#22C55E" : "var(--border)"}` }}>
                  {done && <svg width="10" height="10" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </div>
                <p style={{ flex:1, fontSize:"13px", color: done ? "var(--text-3)" : "var(--text-1)", textDecoration: done ? "line-through" : "none" }}>{step.label}</p>
                {!done && (
                  <button onClick={() => navigate(step.path)} style={{ padding:"4px 12px", background:"var(--brand)", border:"none", borderRadius:"6px", color:"white", fontSize:"11px", cursor:"pointer", fontWeight:"500", whiteSpace:"nowrap" }}>
                    {step.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const S = {
  statCard: {
    background:"var(--bg-card)", border:"1px solid var(--border)",
    borderRadius:"var(--radius-lg)", padding:"16px",
    boxShadow:"var(--shadow-sm)", transition:"box-shadow 0.2s",
  },
  moduleCard: {
    background:"var(--bg-card)", border:"1px solid var(--border)",
    borderRadius:"var(--radius-lg)", padding:"16px",
    cursor:"pointer", transition:"all 0.2s",
    boxShadow:"var(--shadow-sm)",
  },
  checklistCard: {
    background:"var(--bg-card)", border:"1px solid var(--border)",
    borderRadius:"var(--radius-lg)", padding:"20px",
    boxShadow:"var(--shadow-sm)",
  },
};