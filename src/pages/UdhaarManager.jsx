import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../firebase/config";
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query, where, serverTimestamp, updateDoc,
} from "firebase/firestore";

// Udhaar Manager — who owes you, whom you owe
// Pakistan-specific: amounts in PKR, common names, simple UX

const TYPES = [
  { value: "given",    label: "Maine diya",   sub: "I lent money",      color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  { value: "taken",   label: "Mujhe mila",   sub: "I borrowed money",   color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
];

export default function UdhaarManager() {
  const uid = auth.currentUser?.uid;

  const [records,     setRecords]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [toast,       setToast]       = useState(null);
  const [filterType,  setFilterType]  = useState("all");

  // Form state
  const [type,    setType]    = useState("given");
  const [name,    setName]    = useState("");
  const [amount,  setAmount]  = useState("");
  const [note,    setNote]    = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving,  setSaving]  = useState(false);

  const loadRecords = useCallback(async () => {
    if (!uid) return;
    const q = query(collection(db, "udhaar"), where("uid", "==", uid));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setRecords(list);
    setLoading(false);
  }, [uid]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  function showToastMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    if (!name.trim() || !amount) { showToastMsg("Name aur amount zaroori hai", "error"); return; }
    setSaving(true);
    await addDoc(collection(db, "udhaar"), {
      uid, type, name: name.trim(),
      amount: Number(amount),
      note: note.trim(),
      dueDate: dueDate || null,
      settled: false,
      createdAt: serverTimestamp(),
    });
    setName(""); setAmount(""); setNote(""); setDueDate(""); setType("given");
    setSaving(false); setShowForm(false);
    showToastMsg("Entry saved ✓");
    loadRecords();
  }

  async function handleSettle(id) {
    await updateDoc(doc(db, "udhaar", id), { settled: true });
    showToastMsg("Settled ✓");
    loadRecords();
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "udhaar", id));
    showToastMsg("Removed");
    loadRecords();
  }

  const filtered   = filterType === "all" ? records : records.filter(r => r.type === filterType);
  const totalGiven = records.filter(r => r.type === "given" && !r.settled).reduce((s, r) => s + r.amount, 0);
  const totalTaken = records.filter(r => r.type === "taken" && !r.settled).reduce((s, r) => s + r.amount, 0);
  const net        = totalGiven - totalTaken;

  const fmtAmt = (n) => `PKR ${Number(n).toLocaleString()}`;

  const focus = e => e.target.style.borderColor = "rgba(91,94,244,0.5)";
  const blur  = e => e.target.style.borderColor = "var(--border)";

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      {/* Toast */}
      {toast && (
        <div style={{ ...S.toast, background: toast.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", borderColor: toast.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)", color: toast.type === "error" ? "var(--danger)" : "var(--success)" }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={S.heading}>Udhaar Manager</h1>
          <p style={S.subheading}>Track your udhaars</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={S.btnPrimary}>
          {showForm ? "✕ Cancel" : "+ Add Entry"}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <div style={{ ...S.card, borderColor: "rgba(34,197,94,0.2)" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>They have to take it from me</p>
          <p style={{ fontSize: "20px", fontWeight: "700", color: "#22c55e" }}>{fmtAmt(totalGiven)}</p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Given</p>
        </div>
        <div style={{ ...S.card, borderColor: "rgba(239,68,68,0.2)" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>I took it from someone</p>
          <p style={{ fontSize: "20px", fontWeight: "700", color: "#ef4444" }}>{fmtAmt(totalTaken)}</p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Taken</p>
        </div>
        <div style={{ ...S.card, borderColor: net >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Net balance</p>
          <p style={{ fontSize: "20px", fontWeight: "700", color: net >= 0 ? "#22c55e" : "#ef4444" }}>
            {net >= 0 ? "+" : ""}{fmtAmt(Math.abs(net))}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{net >= 0 ? "You are owed" : "You owe"} money</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ ...S.card, borderColor: "rgba(91,94,244,0.25)", marginBottom: "16px", animation: "slideUp 0.25s ease" }}>
          <p style={S.cardTitle}>New Udhaar Entry</p>

          {/* Type toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)}
                style={{ padding: "10px", borderRadius: "10px", border: `1px solid ${type === t.value ? t.color : "var(--border)"}`, background: type === t.value ? t.bg : "var(--bg-3)", color: type === t.value ? t.color : "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}>
                <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{t.label}</p>
                <p style={{ fontSize: "11px", opacity: 0.7 }}>{t.sub}</p>
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <p style={S.label}>Name</p>
              <input style={S.input} placeholder="Ahmed Bhai" value={name} onChange={e => setName(e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <p style={S.label}>Amount (PKR)</p>
              <input style={S.input} type="number" placeholder="5000" value={amount} onChange={e => setAmount(e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <p style={S.label}>Note (optional)</p>
              <input style={S.input} placeholder="Marriage expenses..." value={note} onChange={e => setNote(e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <p style={S.label}>Due Date (optional)</p>
              <input style={S.input} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} style={{ ...S.btnPrimary, width: "100%", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : "Save Entry"}
          </button>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[
          { value: "all",   label: `All (${records.length})` },
          { value: "given", label: "Given" },
          { value: "taken", label: "Taken" },
        ].map(f => (
          <button key={f.value} onClick={() => setFilterType(f.value)}
            style={{ padding: "5px 14px", borderRadius: "20px", border: `1px solid ${filterType === f.value ? "var(--brand)" : "var(--border)"}`, background: filterType === f.value ? "var(--brand-dim)" : "transparent", color: filterType === f.value ? "var(--brand-light)" : "var(--text-muted)", fontSize: "12px", cursor: "pointer", transition: "all 0.15s" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "12px", marginBottom: "8px" }} />)
      ) : filtered.length === 0 ? (
        <div style={{ ...S.card, padding: "48px", textAlign: "center" }}>
          <p style={{ fontSize: "32px", marginBottom: "10px" }}>💸</p>
          <p style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "4px" }}>No entries found</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Firstly, add a new udhaar entry</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map(record => {
            const t = TYPES.find(x => x.value === record.type);
            const isOverdue = record.dueDate && new Date(record.dueDate) < new Date() && !record.settled;
            return (
              <div key={record.id} style={{ ...S.card, opacity: record.settled ? 0.5 : 1 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-hover)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" fill="none" stroke={t.color} strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{record.name}</p>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: t.bg, color: t.color, border: `1px solid ${t.color}30` }}>{t.label}</span>
                      {record.settled && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>Settled</span>}
                      {isOverdue && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>Overdue</span>}
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "3px", flexWrap: "wrap" }}>
                      {record.note && <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{record.note}</p>}
                      {record.dueDate && <p style={{ fontSize: "12px", color: isOverdue ? "#ef4444" : "var(--text-muted)" }}>Due: {record.dueDate}</p>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: t.color }}>{fmtAmt(record.amount)}</p>
                    {!record.settled && (
                      <div style={{ display: "flex", gap: "6px", marginTop: "6px", justifyContent: "flex-end" }}>
                        <button onClick={() => handleSettle(record.id)}
                          style={{ padding: "3px 10px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "6px", color: "#22c55e", fontSize: "11px", cursor: "pointer" }}>
                          Settle
                        </button>
                        <button onClick={() => handleDelete(record.id)}
                          style={{ padding: "3px 8px", background: "transparent", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}
                          onMouseEnter={e => e.currentTarget.style.color = "var(--danger)"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
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
  heading:    { fontSize: "22px", fontWeight: "600", color: "var(--text-primary)", margin: 0 },
  subheading: { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" },
  card:       { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", transition: "border-color 0.2s" },
  cardTitle:  { fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" },
  label:      { fontSize: "11px", fontWeight: "500", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" },
  input:      { width: "100%", padding: "9px 12px", background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "13px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" },
  btnPrimary: { padding: "9px 16px", background: "var(--brand)", color: "white", border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "opacity 0.2s" },
  toast:      { position: "fixed", top: "16px", right: "16px", zIndex: 9999, padding: "10px 16px", borderRadius: "10px", border: "1px solid", fontSize: "13px", fontWeight: "500", animation: "slideRight 0.3s ease" },
};