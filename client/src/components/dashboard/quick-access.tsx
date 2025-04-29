import { Link } from "wouter";
import { GitBranch, Database, ClipboardList, BarChart3 } from "lucide-react";

export function QuickAccess() {
  const quickLinks = [
    {
      title: "Network Diagram",
      icon: <GitBranch className="h-8 w-8 text-primary-600 mb-2" />,
      href: "/network"
    },
    {
      title: "Equipment Inventory",
      icon: <Database className="h-8 w-8 text-primary-600 mb-2" />,
      href: "/equipment"
    },
    {
      title: "Work Permits",
      icon: <ClipboardList className="h-8 w-8 text-primary-600 mb-2" />,
      href: "/permits"
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="h-8 w-8 text-primary-600 mb-2" />,
      href: "/analytics"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quickLinks.map((link, index) => (
        <Link key={index} href={link.href}>
          <a className="bg-white p-4 rounded-lg shadow text-center hover:bg-gray-50 transition-colors duration-200">
            {link.icon}
            <div className="font-medium text-neutral-700">{link.title}</div>
          </a>
        </Link>
      ))}
    </div>
  );
}
