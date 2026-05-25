// src/App.jsx — add /documents and /time-capsule routes
// Keep all existing routes, just add new ones

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
import DocumentVault from "./pages/DocumentVault";   // NEW
import UdhaarManager from "./pages/UdhaarManager";   // NEW
import SubscriptionTracker from "./pages/SubscriptionTracker"; // NEW
import TimeCapsule from "./pages/TimeCapsule";       // NEW

function ProtectedRoute({ user, userName, children }) {
  if (user === null) return <Navigate to="/login" />;
  if (user === undefined) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:"32px", height:"32px", border:"2.5px solid #EEF0FD", borderTop:"2.5px solid var(--brand)", borderRadius:"50%", animation:"spin 0.9s linear infinite", margin:"0 auto 12px" }} />
        <p style={{ color:"var(--text-3)", fontSize:"13px" }}>Loading...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return <AppLayout userName={userName}>{children}</AppLayout>;
}

export default function App() {
  const [user,     setUser]     = useState(undefined);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u ?? null);
      if (u) {
        const data = await getUserData();
        if (data?.name) setUserName(data.name);
      }
    });
  }, []);

  const wrap = (el) => <ProtectedRoute user={user} userName={userName}>{el}</ProtectedRoute>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Navigate to="/login" />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/signup"         element={<Signup />} />
        <Route path="/dashboard"      element={wrap(<Dashboard />)} />
        <Route path="/vault"          element={wrap(<Vault />)} />
        <Route path="/nominees"       element={wrap(<Nominees />)} />
        <Route path="/ai-letter"      element={wrap(<AILetter />)} />
        <Route path="/inheritance"    element={wrap(<Inheritance />)} />
        <Route path="/documents"      element={wrap(<DocumentVault />)} />
        <Route path="/udhaar"         element={wrap(<UdhaarManager />)} />
        <Route path="/subscriptions"  element={wrap(<SubscriptionTracker />)} />
        <Route path="/time-capsule"   element={wrap(<TimeCapsule />)} />
        <Route path="/emergency-card" element={<ProtectedRoute user={user}><EmergencyCard /></ProtectedRoute>} />
        <Route path="/emergency/:uid" element={<EmergencyPublic />} />
      </Routes>
    </BrowserRouter>
  );
}