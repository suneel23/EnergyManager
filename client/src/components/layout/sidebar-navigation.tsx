import { useLocation, Link } from "wouter";
import { User } from "@shared/schema";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  isOpen: boolean;
  closeSidebar: () => void;
  user: User;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  section: "monitoring" | "management" | "administration";
}

export function SidebarNavigation({ isOpen, closeSidebar, user }: SidebarNavProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Define navigation items
  const navItems: NavItem[] = [
    { 
      href: "/grid-visualization",
      label: "Grid Visualization",
      icon: "account_tree",
      section: "monitoring"
    },
    { 
      href: "/",
      label: "Dashboards",
      icon: "dashboard",
      section: "monitoring"
    },
    { 
      href: "/energy-analytics",
      label: "Energy Analytics",
      icon: "bar_chart",
      section: "monitoring"
    },
    { 
      href: "/equipment-inventory",
      label: "Equipment Inventory",
      icon: "engineering",
      section: "management"
    },
    { 
      href: "/permit-to-work",
      label: "Permit to Work",
      icon: "work",
      section: "management"
    },
    { 
      href: "/meter-data",
      label: "Meter Data",
      icon: "speed",
      section: "management"
    },
    { 
      href: "/user-management",
      label: "User Management",
      icon: "people",
      section: "administration",
    },
    { 
      href: "/reports",
      label: "Reports",
      icon: "description",
      section: "administration"
    }
  ];

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager" || user.role === "admin";

  return (
    <aside className={cn(
      "sidebar w-64 bg-white shadow-lg h-full flex flex-col z-20 fixed md:relative transition-transform duration-300",
      isOpen ? "transform-none" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-primary font-inter">Energy MS</h1>
          <button onClick={closeSidebar} className="md:hidden text-neutral-500">
            <span className="material-icons">menu_open</span>
          </button>
        </div>
      </div>

      <nav className="flex-grow overflow-y-auto">
        {/* Monitoring Section */}
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">MONITORING</h2>
        </div>
        <ul>
          {navItems
            .filter(item => item.section === "monitoring")
            .map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center px-4 py-3",
                    location === item.href 
                      ? "text-primary-dark bg-blue-50 border-r-4 border-primary" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
        </ul>
        
        {/* Management Section */}
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">MANAGEMENT</h2>
        </div>
        <ul>
          {navItems
            .filter(item => item.section === "management")
            .map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center px-4 py-3",
                    location === item.href 
                      ? "text-primary-dark bg-blue-50 border-r-4 border-primary" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
        </ul>
        
        {/* Administration Section - Only visible to managers and admins */}
        {isManager && (
          <>
            <div className="px-4 pt-6 pb-2">
              <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">ADMINISTRATION</h2>
            </div>
            <ul>
              {navItems
                .filter(item => item.section === "administration")
                .filter(item => item.label !== "User Management" || isAdmin) // Only admins can see user management
                .map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a className={cn(
                        "flex items-center px-4 py-3",
                        location === item.href 
                          ? "text-primary-dark bg-blue-50 border-r-4 border-primary" 
                          : "text-neutral-600 hover:bg-neutral-100"
                      )}>
                        <span className="material-icons mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    </Link>
                  </li>
                ))}
            </ul>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <span className="material-icons text-sm">person</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-700">{user.fullName}</p>
            <p className="text-xs text-neutral-500">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          </div>
          <div className="ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              disabled={logoutMutation.isPending}
              className="text-neutral-500 hover:text-error"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
