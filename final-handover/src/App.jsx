import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import { getUserData } from "./firebase/db";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Vault from "./pages/Vault";
import Nominees from "./pages/Nominees";
import AILetter from "./pages/AILetter";
import Inheritance from "./pages/Inheritance";
import EmergencyCard from "./pages/EmergencyCard";
import EmergencyPublic from "./pages/EmergencyPublic";
function ProtectedRoute({ user, userName, children }) {
  if (user === null) return <Navigate to="/login" />;
  if (user === undefined) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "36px", height: "36px", border: "2px solid rgba(108,71,255,0.2)", borderTop: "2px solid #6c47ff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  return <AppLayout userName={userName}>{children}</AppLayout>;
}

export default function App() {
  const [user, setUser] = useState(undefined);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser ?? null);
      if (currentUser) {
        const data = await getUserData();
        if (data?.name) setUserName(data.name);
      }
    });
    return () => unsubscribe();
  }, []);

  const wrap = (el) => <ProtectedRoute user={user} userName={userName}>{el}</ProtectedRoute>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard"   element={wrap(<Dashboard />)} />
        <Route path="/vault"       element={wrap(<Vault />)} />
        <Route path="/nominees"    element={wrap(<Nominees />)} />
        <Route path="/ai-letter"   element={wrap(<AILetter />)} />
        <Route path="/inheritance" element={wrap(<Inheritance />)} />
        <Route path="/emergency-card" element={
  <ProtectedRoute user={user}><EmergencyCard /></ProtectedRoute>
} />
  <Route path="/emergency/:uid" element={<EmergencyPublic />} />
      </Routes>
    </BrowserRouter>
  );
}