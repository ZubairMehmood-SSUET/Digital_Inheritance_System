// src/pages/TimeCapsule.jsx
// Write messages to be unlocked on a future date

import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function Icon({ d, size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.75" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function countdown(unlockDate) {
  const diff = new Date(unlockDate) - new Date();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 365) return `${Math.floor(d/365)}y ${Math.floor((d%365)/30)}mo`;
  if (d > 30) return `${Math.floor(d/30)} months`;
  if (d > 0) return `${d} days`;
  return `${h} hours`;
}

export default function TimeCapsule() {
  const uid = auth.currentUser?.uid;
  const [capsules,  setCapsules]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [toast,     setToast]     = useState(null);

  const [title,       setTitle]       = useState("");
  const [message,     setMessage]     = useState("");
  const [unlockDate,  setUnlockDate]  = useState("");
  const [recipient,   setRecipient]   = useState("");
  const [saving,      setSaving]      = useState(false);

  // Minimum unlock date: tomorrow
  const minDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const load = useCallback(async () => {
    if (!uid) return;
    const q = query(collection(db, "timeCapsules"), where("uid", "==", uid));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => new Date(a.unlockDate) - new Date(b.unlockDate));
    setCapsules(list);
    setLoading(false);
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSave() {
    if (!title.trim() || !message.trim() || !unlockDate) {
      showToast("Title, message aur unlock date required hai", "error"); return;
    }
    setSaving(true);
    await addDoc(collection(db, "timeCapsules"), {
      uid, title: title.trim(), message: message.trim(),
      unlockDate, recipient: recipient.trim(),
      locked: true, createdAt: serverTimestamp(),
    });
    setTitle(""); setMessage(""); setUnlockDate(""); setRecipient("");
    setSaving(false); setShowForm(false);
    showToast("Time capsule created ✓");
    load();
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "timeCapsules", id));
    showToast("Deleted");
    load();
  }

  const isUnlocked = (c) => new Date(c.unlockDate) <= new Date();

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>

      {toast && (
        <div style={{ ...S.toast, background: toast.type==="error" ? "var(--danger-bg)" : "var(--success-bg)", borderColor: toast.type==="error" ? "#FCA5A5" : "#86EFAC", color: toast.type==="error" ? "var(--danger)" : "#16A34A" }}>
          {toast.type==="error" ? "⚠ " : "✓ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
        <div>
          <h1 style={S.heading}>Time Capsule</h1>
          <p style={S.sub}>Messages that will unlock in the future</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={S.btnPrimary}>
          {showForm ? "✕ Cancel" : "+ New Capsule"}
        </button>
      </div>

      {/* Banner */}
      {!showForm && capsules.length === 0 && !loading && (
        <div style={{ ...S.card, padding:"40px", textAlign:"center", marginBottom:"20px", borderColor:"rgba(139,92,246,0.3)", background:"var(--card-bg)" }}>
          <div style={{ fontSize:"40px", marginBottom:"12px" }}>⏳</div>
          <h2 style={{ fontSize:"17px", fontWeight:"700", color:"var(--text-1)", marginBottom:"6px" }}>Create Your First Time Capsule</h2>
          <p style={{ fontSize:"13px", color:"var(--text-2)", marginBottom:"20px", maxWidth:"340px", margin:"0 auto 20px" }}>
            Write a message that will unlock in 1 year, 10 years, or on a special day. Perfect for future reminders, letters to your future self, or messages for loved ones.
          </p>
          <button onClick={() => setShowForm(true)} style={S.btnPrimary}>Create Time Capsule</button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div style={{ ...S.card, borderColor:"rgba(139,92,246,0.3)", marginBottom:"16px", animation:"slideDown 0.2s ease" }}>
          <p style={S.cardTitle}>🕰 New Time Capsule</p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
            <div>
              <label style={S.label}>Title</label>
              <input style={S.input} placeholder="Message to my future self"
                value={title} onChange={e => setTitle(e.target.value)}
                onFocus={e => e.target.style.borderColor = "#8B5CF6"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>
            <div>
              <label style={S.label}>Unlock Date</label>
              <input style={S.input} type="date" min={minDate}
                value={unlockDate} onChange={e => setUnlockDate(e.target.value)}
                onFocus={e => e.target.style.borderColor = "#8B5CF6"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
                placeholder="Select a date" />
            </div>
          </div>

          <div style={{ marginBottom:"12px" }}>
            <label style={S.label}>Recipient (optional)</label>
            <input style={S.input} placeholder="e.g. My future self, My kids, My best friend"
              value={recipient} onChange={e => setRecipient(e.target.value)}
              onFocus={e => e.target.style.borderColor = "#8B5CF6"}
              onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>

          <div style={{ marginBottom:"16px" }}>
            <label style={S.label}>Your Message</label>
            <textarea style={{ ...S.input, height:"130px", resize:"none" }}
              placeholder="Dear future me, I hope you're doing well..."
              value={message} onChange={e => setMessage(e.target.value)}
              onFocus={e => e.target.style.borderColor = "#8B5CF6"}
              onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>

          {unlockDate && (
            <div style={{ padding:"10px 14px", borderRadius:"var(--radius)", background:"var(--card-bg)", border:"1px solid rgba(139,92,246,0.2)", marginBottom:"14px" }}>
              <p style={{ fontSize:"12px", color:"#8B5CF6", fontWeight:"500" }}>
                ⏳This Message <strong>{new Date(unlockDate).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"})}</strong> will unlock on the specified date.
                {countdown(unlockDate) ? ` — ${countdown(unlockDate)} remaining` : ""}
              </p>
            </div>
          )}

          <button onClick={handleSave} disabled={saving} style={{ ...S.btnPurple, width:"100%", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : "🔒 Seal Capsule"}
          </button>
        </div>
      )}

      {/* Capsules list */}
      {loading ? (
        [1,2,3].map(i => <div key={i} className="skeleton" style={{ height:"100px", borderRadius:"var(--radius-lg)", marginBottom:"10px" }} />)
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {capsules.map(cap => {
            const unlocked = isUnlocked(cap);
            const ct = countdown(cap.unlockDate);
            return (
              <div key={cap.id} style={{ ...S.card, borderLeft:`3px solid ${unlocked ? "#22C55E" : "#8B5CF6"}` }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:"12px" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"var(--radius)", background: unlocked ? "var(--success-bg)" : "#F5F3FF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:"18px" }}>{unlocked ? "📬" : "🔒"}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px", flexWrap:"wrap" }}>
                      <p style={{ fontSize:"14px", fontWeight:"600", color:"var(--text-1)" }}>{cap.title}</p>
                      {cap.recipient && <span style={{ fontSize:"10px", color:"var(--text-3)" }}>→ {cap.recipient}</span>}
                      <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"4px", fontWeight:"600", background: unlocked ? "var(--success-bg)" : "#F5F3FF", color: unlocked ? "#16A34A" : "#8B5CF6" }}>
                        {unlocked ? "✓ Unlocked" : "Locked"}
                      </span>
                    </div>
                    {unlocked ? (
                      <p style={{ fontSize:"13px", color:"var(--text-2)", lineHeight:"1.6", fontStyle:"italic" }}>"{cap.message}"</p>
                    ) : (
                      <p style={{ fontSize:"12px", color:"var(--text-3)" }}>
                        🗓 Unlock: <strong>{new Date(cap.unlockDate).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"})}</strong>
                        {ct && <span style={{ color:"#8B5CF6", fontWeight:"500" }}> · {ct} remaining</span>}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(cap.id)}
                    style={{ background:"transparent", border:"none", color:"var(--text-3)", cursor:"pointer", padding:"4px", fontSize:"14px" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--danger)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const S = {
  heading: { fontSize:"22px", fontWeight:"700", color:"var(--text-1)", letterSpacing:"-0.02em", margin:0 },
  sub:     { fontSize:"13px", color:"var(--text-3)", marginTop:"3px" },
  card:    { background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"18px", boxShadow:"var(--shadow-sm)", transition:"box-shadow 0.2s" },
  cardTitle: { fontSize:"14px", fontWeight:"600", color:"var(--text-1)", marginBottom:"16px" },
  label:   { display:"block", fontSize:"11px", fontWeight:"600", color:"var(--text-2)", marginBottom:"5px" },
  input:   { width:"100%", padding:"9px 12px", background:"white", border:"1.5px solid var(--border)", borderRadius:"var(--radius)", color:"var(--text-1)", fontSize:"13px", outline:"none", transition:"border-color 0.15s", boxSizing:"border-box" },
  btnPrimary: { padding:"9px 18px", background:"var(--brand)", color:"white", border:"none", borderRadius:"var(--radius)", fontSize:"13px", fontWeight:"600", cursor:"pointer", boxShadow:"0 2px 6px rgba(91,103,241,0.25)" },
  btnPurple:  { padding:"11px 18px", background:"#8B5CF6", color:"white", border:"none", borderRadius:"var(--radius)", fontSize:"14px", fontWeight:"600", cursor:"pointer", boxShadow:"0 2px 8px rgba(139,92,246,0.3)" },
  toast: { position:"fixed", top:"16px", right:"16px", zIndex:9999, padding:"10px 16px", borderRadius:"var(--radius)", border:"1px solid", fontSize:"13px", fontWeight:"500", animation:"slideRight 0.25s ease", boxShadow:"var(--shadow)" },
};