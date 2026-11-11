import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", icon: "📊", roles: ["admin", "farm", "inspector", "logistics", "buyer"] },
  { to: "/batches", label: "Batches", icon: "📦", roles: ["admin", "farm", "inspector", "logistics", "buyer"] },
  { to: "/scan", label: "Scan & Handover", icon: "📷", roles: ["admin", "logistics"] },
  { to: "/recall", label: "Search & Recall", icon: "🔎", roles: ["admin", "farm", "inspector", "logistics", "buyer"] },
  { to: "/master-data", label: "Master Data", icon: "🗂️", roles: ["admin", "farm"] },
  { to: "/users", label: "Users", icon: "👥", roles: ["admin"] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = NAV.filter((n) => n.roles.includes(user?.role));

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button className="md:hidden text-slate-600" onClick={() => setOpen(!open)}>☰</button>
            <span className="text-xl">🥚</span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Egg<span className="text-brand-500">Trace</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-800">{user?.name}</div>
              <div className="text-xs capitalize text-slate-500">{user?.role}</div>
            </div>
            <button onClick={handleLogout} className="btn-secondary !px-3 !py-1.5 text-xs">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className={`${open ? "block" : "hidden"} md:block w-full md:w-56 shrink-0`}>
          <nav className="space-y-1">
            {items.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <span>{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
