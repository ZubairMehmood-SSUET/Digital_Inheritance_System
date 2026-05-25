import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logOut } from "../../firebase/auth";

const NAV = [
  {
    group: "Workspace",
    items: [
      { path: "/dashboard",      label: "Overview",          icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>, type: "rect" },
      { path: "/vault",          label: "Vault",             icon: null, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
      { path: "/nominees",       label: "Trusted Contacts",  d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
      { path: "/documents",      label: "Documents",         d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", badge: "New" },
    ],
  },
  {
    group: "Finance",
    items: [
      { path: "/udhaar",         label: "Udhaar Manager",    d: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
      { path: "/subscriptions",  label: "Subscriptions",     d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
    ],
  },
  {
    group: "Legacy",
    items: [
      { path: "/time-capsule",   label: "Time Capsule",      d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", badge: "New" },
      { path: "/inheritance",    label: "Inheritance",       d: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
      { path: "/ai-letter",      label: "AI Life Summary",   d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
      { path: "/emergency-card", label: "Emergency Card",    d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
    ],
  },
];

function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function Sidebar({ userName, mobileOpen, onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  async function handleLogout() {
    await logOut();
    navigate("/login");
  }

  function go(path) {
    navigate(path);
    if (onClose) onClose();
  }

  return (
    <>
      {mobileOpen && (
        <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.4)", zIndex:99, backdropFilter:"blur(2px)" }} />
      )}
      <aside style={{ ...S.sidebar, ...(mobileOpen ? { transform: "translateX(0)" } : {}) }}>

        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize:"13px", fontWeight:"700", color:"var(--text-1)", letterSpacing:"-0.01em" }}>Final Handover</p>
            <p style={{ fontSize:"10px", color:"var(--text-3)", marginTop:"1px" }}>Digital Life Manager</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"8px 10px", overflowY:"auto" }}>
          {NAV.map(({ group, items }) => (
            <div key={group} style={{ marginBottom:"20px" }}>
              <p style={S.groupLabel}>{group}</p>
              {items.map(({ path, label, d, badge }) => {
                const active = pathname === path;
                return (
                  <button key={path} onClick={() => go(path)}
                    style={{ ...S.navItem, ...(active ? S.navActive : {}) }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ color: active ? "var(--brand)" : "var(--text-3)" }}>
                      <Icon d={d} />
                    </span>
                    <span style={{ flex:1, textAlign:"left" }}>{label}</span>
                    {badge && (
                      <span style={{ fontSize:"9px", padding:"2px 6px", borderRadius:"4px", background:"var(--brand-light)", color:"var(--brand)", fontWeight:"600", letterSpacing:"0.03em" }}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:"10px", borderTop:"1px solid var(--border)" }}>
          <div style={S.userBox}>
            <div style={S.avatar}>{(userName || "U").charAt(0).toUpperCase()}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:"12px", fontWeight:"600", color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{userName || "User"}</p>
              <p style={{ fontSize:"10px", color:"var(--text-3)", marginTop:"1px" }}>Free plan</p>
            </div>
            <button onClick={handleLogout} title="Sign out"
              style={{ background:"transparent", border:"none", color:"var(--text-3)", cursor:"pointer", padding:"4px", borderRadius:"6px", display:"flex", alignItems:"center" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--danger-bg)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

const S = {
  sidebar: {
    position:"fixed", left:0, top:0,
    width:"220px", height:"100vh",
    background:"var(--bg-card)",
    borderRight:"1px solid var(--border)",
    display:"flex", flexDirection:"column",
    zIndex:100,
    transition:"transform 0.25s ease",
  },
  logo: {
    display:"flex", alignItems:"center", gap:"10px",
    padding:"16px 14px",
    borderBottom:"1px solid var(--border)",
  },
  logoIcon: {
    width:"28px", height:"28px", borderRadius:"7px",
    background:"var(--brand)",
    display:"flex", alignItems:"center", justifyContent:"center",
    flexShrink:0, boxShadow:"0 2px 8px rgba(91,103,241,0.35)",
  },
  groupLabel: {
    fontSize:"9px", fontWeight:"700", color:"var(--text-3)",
    textTransform:"uppercase", letterSpacing:"0.1em",
    marginBottom:"3px", paddingLeft:"10px",
  },
  navItem: {
    display:"flex", alignItems:"center", gap:"9px",
    width:"100%", padding:"7px 10px",
    borderRadius:"var(--radius-sm)", cursor:"pointer",
    color:"var(--text-2)", fontSize:"13px", fontWeight:"400",
    marginBottom:"1px", background:"transparent", border:"none",
    transition:"background 0.15s",
  },
  navActive: {
    color:"var(--brand)", fontWeight:"500",
    background:"var(--brand-light)",
  },
  userBox: {
    display:"flex", alignItems:"center", gap:"8px",
    padding:"8px 10px", borderRadius:"var(--radius-sm)",
    background:"var(--bg)", border:"1px solid var(--border)",
  },
  avatar: {
    width:"26px", height:"26px", borderRadius:"50%",
    background:"linear-gradient(135deg, var(--brand), var(--purple))",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:"11px", fontWeight:"700", color:"white", flexShrink:0,
  },
};