import Sidebar from "./Sidebar";

export default function AppLayout({ children, userName }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <Sidebar userName={userName} />
      <main style={{ flex: 1, marginLeft: "220px", minHeight: "100vh" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
