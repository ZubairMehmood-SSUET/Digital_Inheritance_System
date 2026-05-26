import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";

// ── Groq AI suggestion ──────────────────────────────────────────────────────
async function fetchAISuggestion(bloodGroup, allergies) {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 120,
        messages: [
          {
            role: "user",
            content: `Emergency medical card ke liye ek short AI tip do (2 lines max, Hinglish):
Blood group: ${bloodGroup}
Allergies: ${allergies || "none"}
Tip should be practical, Pakistan-specific, life-saving. No markdown.`,
          },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

// ── Firestore helpers ───────────────────────────────────────────────────────
async function saveCard(uid, cardData) {
  await setDoc(doc(db, "emergencyCards", uid), {
    ...cardData,
    updatedAt: new Date().toISOString(),
  });
}

async function loadCard(uid) {
  const snap = await getDoc(doc(db, "emergencyCards", uid));
  return snap.exists() ? snap.data() : null;
}

// ── Blood groups ────────────────────────────────────────────────────────────
const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "O+", "O−", "AB+", "AB−"];

// ── Main component ──────────────────────────────────────────────────────────
export default function EmergencyCard() {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;
  const publicUrl = `${window.location.origin}/emergency/${uid}`;

  const [form, setForm] = useState({
    bloodGroup: "B−",
    allergies: "",
    emergencyContact: "",
    emergencyPhone: "",
    doctor: "",
    hospital: "",
    medicalNotes: "",
  });
  const [aiTip, setAiTip] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const aiTimer = useRef(null);

  // Load saved card on mount
  useEffect(() => {
    if (!uid) return;
    loadCard(uid).then((data) => {
      if (data) setForm((f) => ({ ...f, ...data }));
      setLoading(false);
    });
  }, [uid]);

  // AI tip debounce when blood group or allergies change
  useEffect(() => {
    if (!form.bloodGroup) return;
    clearTimeout(aiTimer.current);
    aiTimer.current = setTimeout(async () => {
      setAiLoading(true);
      const tip = await fetchAISuggestion(form.bloodGroup, form.allergies);
      if (tip) setAiTip(tip);
      setAiLoading(false);
    }, 900);
    return () => clearTimeout(aiTimer.current);
  }, [form.bloodGroup, form.allergies]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave() {
    if (!uid) return;
    setSaving(true);
    await saveCard(uid, form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <LoadingScreen />;

  return (
    <div style={S.page}>
      {/* Ambient orbs */}
      <div style={S.orb1} />
      <div style={S.orb2} />

      {/* Top bar */}
      <header style={S.topbar}>
        <button onClick={() => navigate("/dashboard")} style={S.backBtn}>
          <span style={{ fontSize: 18 }}>←</span>
          <span>Dashboard</span>
        </button>
        <div style={S.logoWrap}>
          <div style={S.logoIcon}>⚡</div>
          <div>
            <div style={S.logoTitle}>Emergency Card</div>
            <div style={S.logoSub}>The Final Handover</div>
          </div>
        </div>
        <div style={S.liveBadge}>
          <div style={S.pulseDot} />
          <span style={S.badgeText}>Live</span>
        </div>
      </header>

      {/* Body */}
      <div style={S.body}>
        {/* ── LEFT: Setup form ── */}
        <div style={S.left}>
          <p style={S.sectionLabel}>Configure Emergency Card</p>

          {/* Blood group */}
          <p style={S.fieldLabel}>Blood Group</p>
          <div style={S.bloodGrid}>
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                style={{
                  ...S.bloodBtn,
                  ...(form.bloodGroup === g ? S.bloodBtnActive : {}),
                }}
                onClick={() => setForm((f) => ({ ...f, bloodGroup: g }))}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Fields */}
          {[
            {
              label: "Known Allergies",
              key: "allergies",
              placeholder: "Penicillin, Latex, Nuts...",
            },
            {
              label: "Emergency Contact Name",
              key: "emergencyContact",
              placeholder: "Ahmed Ali",
            },
            {
              label: "Emergency Phone",
              key: "emergencyPhone",
              placeholder: "0312-1234567",
            },
            { label: "Doctor Name", key: "doctor", placeholder: "Dr. Raza" },
            {
              label: "Hospital",
              key: "hospital",
              placeholder: "Aga Khan Hospital, Karachi",
            },
            {
              label: "Medical Notes (optional)",
              key: "medicalNotes",
              placeholder: "Diabetic, takes insulin...",
            },
          ].map(({ label, key, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <p style={S.fieldLabel}>{label}</p>
              <input
                style={S.input}
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary-color)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-color)")
                }
              />
            </div>
          ))}

          {/* AI tip */}
          <div style={S.aiCard}>
            <div style={S.aiTop}>
              <div style={S.aiIconCircle}>✦</div>
              <div>
                <div style={S.aiBadge}>AI Insight</div>
                <div style={S.aiSublabel}>Powered by Groq</div>
              </div>
            </div>
            <p style={S.aiText}>
              {aiLoading
                ? "Analyzing your medical profile..."
                : aiTip || "Enter blood group to get AI-powered medical tips."}
            </p>
          </div>

          {/* Save button */}
          <button
            style={{ ...S.genBtn, opacity: saving ? 0.7 : 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : saved
                ? "✓ Saved!"
                : "Save Emergency Card ↗"}
          </button>
        </div>

        {/* ── RIGHT: Card preview ── */}
        <div style={S.right}>
          <p style={S.sectionLabel}>Live Preview</p>

          <div style={S.cardOuter}>
            <div style={S.cardGlow} />
            <div style={S.cardPreview}>
              {/* Shimmer line top */}
              <div style={S.shimmerLine} />

              {/* User row */}
              <div style={S.cardTop}>
                <div style={S.userRow}>
                  <div style={S.avatar}>
                    {auth.currentUser?.displayName?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>
                  <div>
                    <div style={S.userName}>
                      {auth.currentUser?.displayName ||
                        auth.currentUser?.email?.split("@")[0] ||
                        "User"}
                    </div>
                    <div style={S.userSub}>Emergency Card</div>
                  </div>
                </div>
                <div style={S.bloodBadge}>
                  <div style={S.bloodVal}>{form.bloodGroup || "—"}</div>
                  <div style={S.bloodLbl}>Blood</div>
                </div>
              </div>

              {/* QR Code */}
              <div style={S.qrWrap}>
                <QRCodeCanvas
                  value={publicUrl}
                  size={110}
                  bgColor="transparent"
                  fgColor="#07080f"
                  level="H"
                  style={{ borderRadius: 8 }}
                />
                <span style={S.qrHint}>Scan — No login needed</span>
              </div>

              {/* Info tiles */}
              <div style={S.infoGrid}>
                {[
                  { label: "Allergies", val: form.allergies || "—" },
                  { label: "Emergency", val: form.emergencyContact || "—" },
                  { label: "Doctor", val: form.doctor || "—" },
                  { label: "Hospital", val: form.hospital || "—" },
                ].map(({ label, val }) => (
                  <div key={label} style={S.infoTile}>
                    <div style={S.infoLbl}>{label}</div>
                    <div style={S.infoVal}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Share URL */}
          <div style={S.urlBox}>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={S.urlLabel}>Public Card URL</div>
              <div style={S.urlText}>{publicUrl}</div>
            </div>
            <button style={S.copyBtn} onClick={handleCopy}>
              {copied ? "✓" : "Copy"}
            </button>
          </div>

          {/* Action row */}
          <div style={S.actionRow}>
            <button style={S.actPrimary} onClick={handleSave}>
              {saved ? "✓ Saved!" : "Save Card"}
            </button>
            <button style={S.actGhost} onClick={handleCopy}>
              Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading screen ──────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "2px solid rgba(245,158,11,0.15)",
            borderTop: "2px solid #f59e0b",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite",
          }}
        />
        <p
          style={{
            color: "var(--secondary-text)",
            fontSize: 13,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.08em",
          }}
        >
          Loading card...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-color)",
    fontFamily: "'Space Grotesk', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  orb1: {
    position: "fixed", top: -120, left: -80,
    width: 500, height: 500,
    background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },
  orb2: {
    position: "fixed", bottom: -100, right: -60,
    width: 400, height: 400,
    background: "radial-gradient(circle, rgba(180,83,9,0.06) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },
  topbar: {
    background: "var(--card-bg)",
    borderBottom: "1px solid var(--border-color)",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative", zIndex: 10,
    transition: "background-color 0.3s, border-color 0.3s",
  },
  backBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: 10, padding: "8px 14px",
    color: "var(--secondary-text)", fontSize: 13,
    cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
    transition: "all 0.2s",
  },
  logoWrap: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: {
    width: 34, height: 34,
    background: "linear-gradient(135deg,#f59e0b,#d97706)",
    borderRadius: 10, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 16,
  },
  logoTitle: { fontSize: 14, fontWeight: 600, color: "var(--text-color)", letterSpacing: "0.02em" },
  logoSub: { fontSize: 9, color: "var(--secondary-text)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 3 },
  liveBadge: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "7px 16px",
    background: "rgba(245,158,11,0.06)",
    border: "1px solid rgba(245,158,11,0.15)",
    borderRadius: 100,
  },
  pulseDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#f59e0b",
    boxShadow: "0 0 8px rgba(245,158,11,0.6)",
  },
  badgeText: { fontSize: 10, fontWeight: 600, color: "#f59e0b", letterSpacing: "0.1em", textTransform: "uppercase" },
  body: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    maxWidth: 1100, margin: "0 auto",
    padding: "0 32px 40px",
    gap: 0, position: "relative", zIndex: 1,
  },
  left: { padding: "32px 32px 32px 0", borderRight: "1px solid var(--border-color)" },
  right: { padding: "32px 0 32px 32px" },
  sectionLabel: { fontSize: 9, fontWeight: 600, color: "var(--secondary-text)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 },
  fieldLabel: { fontSize: 9, fontWeight: 600, color: "var(--secondary-text)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 },
  bloodGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: 24 },
  bloodBtn: {
    padding: "10px 4px", borderRadius: 12, textAlign: "center",
    fontSize: 12, fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    background: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    color: "var(--secondary-text)",
    cursor: "pointer", transition: "all 0.2s ease",
    letterSpacing: "0.03em",
  },
  bloodBtnActive: {
    background: "linear-gradient(135deg,rgba(245,158,11,0.25),rgba(180,83,9,0.2))",
    borderColor: "#f59e0b",
    color: "#fbbf24",
    transform: "scale(1.06)",
    boxShadow: "0 0 18px rgba(245,158,11,0.25), inset 0 0 6px rgba(245,158,11,0.1)",
  },
  input: {
    width: "100%", padding: "12px 16px",
    background: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: 14, color: "var(--text-color)",
    fontSize: 13, fontFamily: "'Space Grotesk', sans-serif",
    outline: "none", boxSizing: "border-box",
    transition: "all 0.3s ease",
  },
  aiCard: {
    background: "var(--bg-color)",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: 16, padding: "18px 18px 16px",
    marginBottom: 24, marginTop: 8,
    backgroundImage: "linear-gradient(135deg,rgba(245,158,11,0.06) 0%,transparent 60%)",
  },
  aiTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  aiIconCircle: {
    width: 28, height: 28, borderRadius: "50%",
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, color: "#f59e0b", flexShrink: 0,
  },
  aiBadge: { fontSize: 9, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase" },
  aiSublabel: { fontSize: 9, color: "rgba(245,158,11,0.6)", marginTop: 2 },
  aiText: { fontSize: 12, color: "var(--text-color)", lineHeight: 1.65 },
  genBtn: {
    width: "100%", padding: 14,
    background: "linear-gradient(135deg,#f59e0b,#d97706,#b45309)",
    color: "#ffffff", border: "none", borderRadius: 14,
    fontSize: 13, fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: "0.05em", cursor: "pointer",
    boxShadow: "0 4px 24px rgba(245,158,11,0.2)",
    transition: "all 0.25s",
  },
  cardOuter: { position: "relative", marginBottom: 16 },
  cardGlow: {
    position: "absolute", inset: -1, borderRadius: 22,
    background: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(180,83,9,0.08))",
    filter: "blur(14px)", zIndex: 0, transform: "scale(1.02)",
  },
  cardPreview: {
    background: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: 20, padding: 22,
    position: "relative", zIndex: 1,
    transition: "all 0.3s ease",
  },
  shimmerLine: {
    position: "absolute", top: 0, left: 0, right: 0, height: 1,
    background: "linear-gradient(90deg,transparent,rgba(245,158,11,0.5),transparent)",
    borderRadius: "20px 20px 0 0",
  },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  userRow: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    width: 42, height: 42, borderRadius: "50%",
    background: "linear-gradient(135deg,#f59e0b,#b45309)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, fontWeight: 700, color: "#ffffff",
    border: "2px solid rgba(245,158,11,0.25)",
    boxShadow: "0 0 16px rgba(245,158,11,0.15)",
  },
  userName: { fontSize: 15, fontWeight: 600, color: "var(--text-color)", letterSpacing: "0.01em" },
  userSub: { fontSize: 9, color: "var(--secondary-text)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 },
  bloodBadge: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 12, padding: "8px 14px", textAlign: "center",
    boxShadow: "0 0 16px rgba(239,68,68,0.08)",
  },
  bloodVal: { fontSize: 20, fontWeight: 800, color: "#f87171", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, letterSpacing: "0.02em" },
  bloodLbl: { fontSize: 8, color: "rgba(239,68,68,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 },
  qrWrap: {
    background: "linear-gradient(145deg,#fff,#f5f0e8)",
    borderRadius: 16, padding: "16px",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 10, marginBottom: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  qrHint: { fontSize: 9, color: "#666666", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  infoTile: {
    background: "var(--bg-color)",
    border: "1px solid var(--border-color)",
    borderRadius: 12, padding: "10px 14px",
    transition: "all 0.3s",
  },
  infoLbl: { fontSize: 9, fontWeight: 600, color: "var(--secondary-text)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 },
  infoVal: { fontSize: 12, fontWeight: 500, color: "var(--text-color)", letterSpacing: "0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  urlBox: {
    display: "flex", alignItems: "center", gap: 12,
    background: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: 12, padding: "12px 16px", marginBottom: 12,
    transition: "all 0.3s",
  },
  urlLabel: { fontSize: 9, color: "var(--secondary-text)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 },
  urlText: { fontSize: 11, color: "var(--primary-color)", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  copyBtn: {
    padding: "7px 14px",
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: 8, color: "#f59e0b",
    fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
    flexShrink: 0, transition: "all 0.2s",
  },
  actionRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  actPrimary: {
    padding: 12,
    background: "linear-gradient(135deg,#f59e0b,#b45309)",
    color: "#ffffff", border: "none", borderRadius: 12,
    fontSize: 13, fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    cursor: "pointer", letterSpacing: "0.04em",
    boxShadow: "0 4px 16px rgba(245,158,11,0.2)",
    transition: "all 0.2s",
  },
  actGhost: {
    padding: 12,
    background: "var(--card-bg)",
    color: "var(--text-color)",
    border: "1px solid var(--border-color)",
    borderRadius: 12, fontSize: 13, fontWeight: 500,
    fontFamily: "'Space Grotesk', sans-serif",
    cursor: "pointer", transition: "all 0.2s",
  },
};

