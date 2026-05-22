import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUserData, updateLastLogin, getDaysRemaining, getNominees } from "../firebase/db";
import { sendAlertEmail } from "../utils/emailService";
import { logOut } from "../firebase/auth";

const NAV_CARDS = [
  { path: "/vault",       label: "Vault",       sub: "Encrypted assets",    emoji: "🔐", color: "#7c3aed" },
  { path: "/nominees",    label: "Nominees",     sub: "Trusted people",      emoji: "👥", color: "#10b981" },
  { path: "/inheritance", label: "Inheritance",  sub: "Distribution plans",  emoji: "⚖️", color: "#f59e0b" },
  { path: "/ai-letter",   label: "AI Letter",    sub: "Farewell message",    emoji: "🤖", color: "#60a5fa" },
  { path: "/emergency-card", label: "Emergency Card", sub: "QR medical card", emoji: "🆘", color: "#ef4444" },
];

export default function Dashboard() {
  const [userData, setUserData]   = useState(null);
  const [daysLeft, setDaysLeft]   = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    const data = await getUserData();
    if (data) {
      setUserData(data);
      const days = getDaysRemaining(data.lastLogin, data.inactivityDays || 180);
      setDaysLeft(days);
      if (days <= 30) {
        const nominees = await getNominees();
        nominees.forEach((n) => sendAlertEmail(n.email, n.name, data.name, 180 - days));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCheckIn() {
    await updateLastLogin();
    setCheckedIn(true);
    setDaysLeft(180);
    setTimeout(() => setCheckedIn(false), 4000);
  }

  async function handleLogout() {
    await logOut();
    navigate("/login");
  }

  const maxDays      = userData?.inactivityDays || 180;
  const pct          = daysLeft !== null ? Math.min(100, (daysLeft / maxDays) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const strokeDash   = (pct / 100) * circumference;

  const timerStatus  = daysLeft === null ? "loading"
    : daysLeft <= 30  ? "danger"
    : daysLeft <= 60  ? "warning"
    : "safe";

  const cfg = {
    safe:    { stroke: "#10b981", shadow: "0 0 20px rgba(16,185,129,0.4)",  label: "Protected", msg: "✦ Your legacy is secure",    badge: { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  text: "#34d399" } },
    warning: { stroke: "#f59e0b", shadow: "0 0 20px rgba(245,158,11,0.4)",  label: "Warning",   msg: "⚡ Check in soon",            badge: { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  text: "#fbbf24" } },
    danger:  { stroke: "#ef4444", shadow: "0 0 20px rgba(239,68,68,0.4)",   label: "Critical",  msg: "⚠️ Check in immediately",     badge: { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   text: "#f87171" } },
    loading: { stroke: "#334155", shadow: "none",                            label: "...",       msg: "Loading...",                  badge: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", text: "#64748b" } },
  }[timerStatus];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "2px solid rgba(124,58,237,0.2)", borderTop: "2px solid #7c3aed", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading your legacy...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      {/* Sidebar */}
      <aside style={S.sidebar}>
        {/* Logo */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>⚡</div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Final Handover</span>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", paddingLeft: "42px" }}>Digital Legacy</p>
        </div>

        <p style={S.navLabel}>Navigation</p>
        {[
          { to: "/dashboard",   emoji: "⊞",  label: "Overview",     active: true  },
          { to: "/vault",       emoji: "🔐", label: "Vault",        active: false },
          { to: "/nominees",    emoji: "👥", label: "Nominees",     active: false },
          { to: "/ai-letter",   emoji: "🤖", label: "AI Letter",    active: false },
        ].map((item) => (
          <Link key={item.to} to={item.to} style={item.active ? S.navActive : S.navItem}
            onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-primary)"; }}}
            onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}}>
            <span style={{ fontSize: "16px" }}>{item.emoji}</span>
            {item.label}
          </Link>
        ))}

        {/* User + logout */}
        <div style={{ marginTop: "auto" }}>
          <div style={S.userBox}>
            <div style={S.userAvatar}>{userData?.name?.charAt(0)?.toUpperCase() || "U"}</div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userData?.name || "User"}</p>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>Active</p>
            </div>
          </div>
          <button onClick={handleLogout} style={S.logoutBtn}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={S.main}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
              Welcome back,{" "}
              <span style={{ background: "linear-gradient(135deg,#a78bfa,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {userData?.name?.split(" ")[0] || "User"}
              </span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>Your digital legacy is being protected</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", background: cfg.badge.bg, border: `0.5px solid ${cfg.badge.border}` }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: cfg.badge.text, boxShadow: timerStatus === "safe" ? `0 0 8px ${cfg.badge.text}` : "none" }} />
            <span style={{ fontSize: "12px", fontWeight: "500", color: cfg.badge.text }}>{cfg.label}</span>
          </div>
        </div>

        {/* Top row — timer + stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }}>

          {/* Timer card */}
          <div style={{ ...S.card, padding: "28px", textAlign: "center", border: timerStatus === "danger" ? "0.5px solid rgba(239,68,68,0.3)" : timerStatus === "warning" ? "0.5px solid rgba(245,158,11,0.3)" : "0.5px solid rgba(16,185,129,0.2)" }}>
            <p style={S.sectionLabel}>Dead Man's Switch</p>

            <div style={{ position: "relative", width: "150px", height: "150px", margin: "16px auto" }}>
              <svg width="150" height="150" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
                <circle cx="60" cy="60" r="54" fill="none"
                  stroke={cfg.stroke}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  style={{ filter: `drop-shadow(0 0 8px ${cfg.stroke})`, transition: "stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "34px", fontWeight: "700", color: cfg.stroke, lineHeight: 1 }}>{daysLeft ?? "—"}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>days left</span>
              </div>
            </div>

            <p style={{ fontSize: "13px", fontWeight: "500", color: cfg.stroke, margin: "0 0 16px" }}>{cfg.msg}</p>

            {checkedIn ? (
              <div style={{ background: "rgba(16,185,129,0.1)", border: "0.5px solid rgba(16,185,129,0.25)", borderRadius: "12px", padding: "13px", color: "#34d399", fontSize: "13px", fontWeight: "500" }}>
                ✓ Timer reset — 180 days
              </div>
            ) : (
              <button onClick={handleCheckIn} style={{ ...S.btnPrimary, width: "100%", background: timerStatus === "danger" ? "linear-gradient(135deg,#ef4444,#b91c1c)" : "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: timerStatus === "danger" ? "0 4px 20px rgba(239,68,68,0.3)" : "0 4px 20px rgba(124,58,237,0.3)" }}>
                I'm Alive — Reset Timer
              </button>
            )}
          </div>

          {/* Stats 2x2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { label: "Timer Status",     value: cfg.label,         sub: `${daysLeft ?? "—"} days remaining`,    color: cfg.stroke },
              { label: "Account",          value: "Active",          sub: userData?.email || "—",                  color: "#a78bfa"  },
              { label: "Inactivity Limit", value: `${maxDays} days`, sub: "Before trigger fires",                  color: "#60a5fa"  },
              { label: "Legacy Status",    value: "Configured",      sub: "Plans ready",                           color: "#34d399"  },
            ].map((s, i) => (
              <div key={i} style={S.card}>
                <p style={S.sectionLabel}>{s.label}</p>
                <p style={{ fontSize: "20px", fontWeight: "700", color: s.color, margin: "8px 0 4px" }}>{s.value}</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nav module cards */}
        <p style={{ ...S.sectionLabel, marginBottom: "12px" }}>Your Legacy Modules</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
          {NAV_CARDS.map(({ path, label, sub, emoji, color }) => (
            <div key={path} onClick={() => navigate(path)} style={S.moduleCard}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "12px" }}>
                {emoji}
              </div>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 4px" }}>{label}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 12px" }}>{sub}</p>
              <p style={{ fontSize: "11px", color: color, margin: 0, opacity: 0.8 }}>Open →</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div style={S.card}>
          <p style={{ ...S.sectionLabel, marginBottom: "20px" }}>Trigger Timeline</p>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
            <div style={{ position: "absolute", top: "12px", left: "5%", right: "5%", height: "1px", background: "rgba(255,255,255,0.08)" }} />
            {[
              { label: "Now",               sub: "Active",       done: true,                          color: "#10b981" },
              { label: `Day ${Math.round(maxDays*0.25)}`, sub: "1st Alert",  done: daysLeft < maxDays*0.75, color: "#f59e0b" },
              { label: `Day ${Math.round(maxDays*0.5)}`,  sub: "2nd Alert",  done: daysLeft < maxDays*0.5,  color: "#f59e0b" },
              { label: `Day ${Math.round(maxDays*0.75)}`, sub: "Final Alert",done: daysLeft < maxDays*0.25, color: "#ef4444" },
              { label: `Day ${maxDays}`,    sub: "Trigger",      done: daysLeft === 0,                color: "#7c3aed" },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1 }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: step.done ? step.color : "rgba(255,255,255,0.05)", border: `2px solid ${step.done ? step.color : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: step.done ? `0 0 12px ${step.color}60` : "none", transition: "all 0.5s ease" }}>
                  {step.done && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "white" }} />}
                </div>
                <p style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-secondary)", margin: 0, textAlign: "center" }}>{step.label}</p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{step.sub}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',sans-serif; }
        :root {
          --bg-primary:#050508; --bg-secondary:#0d0d14;
          --text-primary:#f8fafc; --text-secondary:#94a3b8; --text-muted:#475569;
        }
        body { background:var(--bg-primary); color:var(--text-primary); }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#7c3aed;border-radius:2px}
        a { text-decoration:none; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </>
  );
}

const S = {
  sidebar: { position:"fixed", left:0, top:0, width:"220px", height:"100vh", background:"rgba(5,5,8,0.97)", borderRight:"0.5px solid rgba(255,255,255,0.08)", padding:"24px 16px", display:"flex", flexDirection:"column", zIndex:100, backdropFilter:"blur(20px)" },
  navLabel: { fontSize:"10px", color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"8px", paddingLeft:"12px" },
  navItem: { display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", borderRadius:"10px", cursor:"pointer", color:"#94a3b8", fontSize:"13px", fontWeight:"400", marginBottom:"2px", background:"transparent", transition:"all 0.2s" },
  navActive: { display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", borderRadius:"10px", cursor:"pointer", color:"#a78bfa", fontSize:"13px", fontWeight:"500", marginBottom:"2px", background:"rgba(124,58,237,0.15)", border:"0.5px solid rgba(124,58,237,0.25)", textDecoration:"none" },
  userBox: { background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"12px", marginBottom:"10px", display:"flex", alignItems:"center", gap:"10px" },
  userAvatar: { width:"30px", height:"30px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"600", color:"white", flexShrink:0 },
  logoutBtn: { width:"100%", padding:"10px", background:"transparent", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"#94a3b8", fontSize:"13px", cursor:"pointer", fontFamily:"Inter,sans-serif", transition:"border-color 0.2s" },
  main: { marginLeft:"220px", padding:"32px", position:"relative", zIndex:1, minHeight:"100vh" },
  card: { background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"20px", backdropFilter:"blur(10px)", transition:"all 0.3s ease" },
  sectionLabel: { fontSize:"10px", color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em", margin:0 },
  btnPrimary: { padding:"13px 24px", color:"white", border:"none", borderRadius:"12px", fontSize:"14px", fontWeight:"500", cursor:"pointer", fontFamily:"Inter,sans-serif", transition:"all 0.3s ease" },
  moduleCard: { background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"18px", cursor:"pointer", transition:"all 0.3s ease" },
};
