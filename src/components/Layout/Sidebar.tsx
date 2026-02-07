import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  KeyRound,
  Shield,
  FileText,
  ChevronUp,
  LogOut,
} from "lucide-react";
import logoLight from "@/assets/logo_light.png";
import logoDark from "@/assets/logo_dark.png";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import "@/assets/css/private_navbar.css";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Credentials", href: "/credentials", icon: KeyRound },
  { name: "OAuth consent", href: "/oauth-consent", icon: Shield },
  { name: "Usage agreements", href: "/usage-agreements", icon: FileText },
];

export const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user?.full_name || "User";
  const email = user?.email || "";
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div id="nav-bar">
      <input
        id="nav-toggle"
        type="checkbox"
        checked={!isOpen}
        onChange={() => setIsOpen(!isOpen)}
      />
      <div id="nav-header">
        <NavLink id="nav-title" to="/dashboard">
          <div className="rounded-2xl flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-card">
              <img
                src={logoLight}
                alt="SVA"
                className="h-8 w-auto object-contain block dark:hidden"
              />
              <img
                src={logoDark}
                alt="SVA"
                className="h-8 w-auto object-contain hidden dark:block"
              />
            </div>
            <span className="font-semibold truncate">SVA OAuth</span>
          </div>
        </NavLink>
        <label htmlFor="nav-toggle" aria-label="Toggle sidebar">
          <span id="nav-toggle-burger" />
        </label>
        <hr />
      </div>

      <div id="nav-content">
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
        <div id="nav-highlight" />
      </div>

      <input
        id="nav-footer-toggle"
        type="checkbox"
        checked={isFooterOpen}
        onChange={(e) => setIsFooterOpen(e.target.checked)}
      />
      <div id="nav-footer">
        <div id="nav-footer-heading">
          <div id="nav-footer-avatar">{initials}</div>
          <div id="nav-footer-titlebox">
            <span id="nav-footer-title" title={displayName}>
              {displayName.length > 15 ? `${displayName.slice(0, 15)}...` : displayName}
            </span>
            <span id="nav-footer-subtitle" title={email}>
              {email.length > 20 ? `${email.slice(0, 20)}...` : email}
            </span>
          </div>
          <div id="nav-footer-actions" className="ml-auto flex items-center gap-1 pr-1">
            <ThemeToggle />
            <label htmlFor="nav-footer-toggle" aria-label="Expand footer">
              <ChevronUp className="h-4 w-4" />
            </label>
          </div>
        </div>
        <div id="nav-footer-content">
          <button type="button" className="btn-logout" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
