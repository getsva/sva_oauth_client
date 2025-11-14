import { Link, useLocation } from "react-router-dom";
import { 
  LayoutGrid, 
  BookOpen, 
  KeyRound, 
  Shield, 
  FileText,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Library", href: "/library", icon: BookOpen },
  { name: "Credentials", href: "/credentials", icon: KeyRound },
  { name: "OAuth consent screen", href: "/oauth-consent", icon: Shield },
  { name: "Page usage agreements", href: "/usage-agreements", icon: FileText },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-sidebar-foreground">API</span>
        </div>
        <h2 className="text-base font-semibold text-sidebar-foreground">APIs & Services</h2>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
