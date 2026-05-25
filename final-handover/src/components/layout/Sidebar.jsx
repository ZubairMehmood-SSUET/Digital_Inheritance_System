import { useNavigate, useLocation } from "react-router-dom";
import { logOut } from "../../firebase/auth";

const NAV = [
  { path: "/dashboard",   label: "Overview",     icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { path: "/vault",       label: "Vault",        icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  { path: "/nominees",    label: "Nominees",     icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { path: "/inheritance", label: "Inheritance",  icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
  { path: "/ai-letter",   label: "AI Letter",    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { path: "/emergency-card", label: "Emergency Card", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
];

export default function Sidebar({ userName }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  async function handleLogout() {
    await logOut();
    navigate("/login");
  }

  return (
    <aside style={S.sidebar}>
      {/* Logo */}
      <div style={S.logoWrap}>
        <div style={S.logoIcon}>
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", lineHeight: 1 }}>Final Handover</p>
          <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "3px" }}>Digital Legacy</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        <p style={S.navLabel}>Navigation</p>
        {NAV.map(({ path, label, icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={active ? S.navActive : S.navItem}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-primary)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
              {active && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--brand)", flexShrink: 0 }} />}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--border)" }}>
        <div style={S.userBox}>
          <div style={S.userAvatar}>{(userName || "U").charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName || "User"}</p>
            <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>Active</p>
          </div>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--success)", animation: "pulseSlow 3s infinite", flexShrink: 0 }} />
        </div>
        <button onClick={handleLogout} style={S.logoutBtn}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,77,77,0.35)"; e.currentTarget.style.color = "var(--danger)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

const S = {
  sidebar: { position: "fixed", left: 0, top: 0, width: "220px", height: "100vh", background: "rgba(8,8,16,0.97)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", zIndex: 100, backdropFilter: "blur(20px)" },
  logoWrap: { display: "flex", alignItems: "center", gap: "10px", padding: "20px 16px", borderBottom: "1px solid var(--border)" },
  logoIcon: { width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#6c47ff,#4f2fe0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 16px rgba(108,71,255,0.4)" },
  navLabel: { fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "12px" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 12px", borderRadius: "10px", cursor: "pointer", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "400", marginBottom: "2px", background: "transparent", border: "none", transition: "all 0.2s" },
  navActive: { display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 12px", borderRadius: "10px", cursor: "pointer", color: "var(--brand-light)", fontSize: "13px", fontWeight: "500", marginBottom: "2px", background: "rgba(108,71,255,0.15)", border: "1px solid rgba(108,71,255,0.25)" },
  userBox: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", marginBottom: "8px" },
  userAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#6c47ff,#4f2fe0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", color: "white", flexShrink: 0 },
  logoutBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "9px", background: "transparent", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer", transition: "all 0.2s" },
};
