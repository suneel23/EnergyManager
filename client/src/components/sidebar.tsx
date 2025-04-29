import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/hooks/use-language";
import { 
  LayoutDashboard, 
  BarChart3, 
  Cog, 
  Database, 
  Users, 
  FileText, 
  GitBranch, 
  ClipboardList
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navigationItems = [
    {
      category: t('overview'),
      items: [
        {
          name: t('dashboard'),
          icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
          path: "/"
        },
        {
          name: t('network_diagram'),
          icon: <GitBranch className="h-5 w-5 mr-3" />,
          path: "/network"
        },
        {
          name: t('equipment'),
          icon: <Database className="h-5 w-5 mr-3" />,
          path: "/equipment"
        },
        {
          name: t('work_permits'),
          icon: <ClipboardList className="h-5 w-5 mr-3" />,
          path: "/permits"
        },
        {
          name: t('analytics'),
          icon: <BarChart3 className="h-5 w-5 mr-3" />,
          path: "/analytics"
        },
        {
          name: t('reports'),
          icon: <FileText className="h-5 w-5 mr-3" />,
          path: "/reports"
        }
      ]
    },
    {
      category: t('settings'),
      items: [
        {
          name: t('users'),
          icon: <Users className="h-5 w-5 mr-3" />,
          path: "/users"
        },
        {
          name: t('settings'),
          icon: <Cog className="h-5 w-5 mr-3" />,
          path: "/settings"
        }
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className={cn("bg-white shadow-md w-64 flex-shrink-0 hidden md:flex md:flex-col h-screen", className)}>
      <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
        <Logo />
      </div>
      
      <nav className="flex flex-col flex-1 overflow-y-auto">
        {navigationItems.map((category, categoryIndex) => (
          <div key={categoryIndex} className="py-2">
            <div className="px-4 py-2 text-neutral-500 text-sm font-medium">
              {category.category}
            </div>
            
            {category.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                href={item.path}
                className={cn(
                  "flex items-center px-6 py-3 text-neutral-700 hover:bg-gray-100 transition-colors duration-150",
                  isActive(item.path) && "bg-primary-50 border-l-4 border-primary-600 text-primary-700"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}
