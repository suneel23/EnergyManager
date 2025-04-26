import { useState } from "react";
import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopNavigationProps {
  toggleSidebar: () => void;
  user: User;
  pageTitle?: string;
}

interface TabItem {
  id: string;
  label: string;
  path: string;
}

export function TopNavigation({ toggleSidebar, user, pageTitle }: TopNavigationProps) {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Determine which page we're on to show the correct page title and tabs
  const currentPath = location.split('/')[1] || 'dashboard';
  const displayTitle = pageTitle || getCurrentPageTitle(currentPath);
  
  // Get tabs for current page
  const tabs = getTabsForCurrentPage(currentPath);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log(`Searching for: ${searchQuery}`);
  };
  
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="md:hidden mr-4 text-neutral-500 hover:text-neutral-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-neutral-700 font-inter">{displayTitle}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <Input
                className="pl-10 pr-4 py-2 w-[200px] lg:w-[300px]"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            </form>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-neutral-100 text-neutral-500"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 font-medium border-b">Notifications</div>
              <div className="py-2">
                <div className="px-3 py-2 text-sm hover:bg-neutral-100 cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="material-icons text-error text-sm">error</span>
                    <div>
                      <p className="font-medium">Alert: Feeder Failure</p>
                      <p className="text-xs text-neutral-500">10 minutes ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2 text-sm hover:bg-neutral-100 cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="material-icons text-warning text-sm">warning</span>
                    <div>
                      <p className="font-medium">Warning: Voltage Fluctuation</p>
                      <p className="text-xs text-neutral-500">32 minutes ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2 text-sm hover:bg-neutral-100 cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="material-icons text-info text-sm">info</span>
                    <div>
                      <p className="font-medium">Work Permit Approved</p>
                      <p className="text-xs text-neutral-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t text-center">
                <Button variant="link" size="sm" className="text-primary">View All Notifications</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" className="hover:bg-neutral-100 text-neutral-500">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation if page has tabs */}
      {tabs.length > 0 && (
        <div className="px-4 py-2 bg-white border-t border-neutral-100">
          <div className="flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "pb-2 font-medium text-sm whitespace-nowrap",
                  tab.path === location
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
                onClick={() => navigate(tab.path)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

// Helper functions to get page title and tabs
function getCurrentPageTitle(path: string): string {
  switch (path) {
    case 'grid-visualization':
      return 'Grid Visualization';
    case 'energy-analytics':
      return 'Energy Analytics';
    case 'equipment-inventory':
      return 'Equipment Inventory';
    case 'permit-to-work':
      return 'Permit to Work';
    case 'meter-data':
      return 'Meter Data';
    case 'user-management':
      return 'User Management';
    case 'reports':
      return 'Reports';
    default:
      return 'Dashboard';
  }
}

function getTabsForCurrentPage(path: string): TabItem[] {
  switch (path) {
    case 'grid-visualization':
      return [
        { id: 'single-line', label: 'Single Line Diagram', path: '/grid-visualization' },
        { id: 'energy-flow', label: 'Energy Flow', path: '/grid-visualization/energy-flow' },
        { id: 'substation', label: 'Substation View', path: '/grid-visualization/substation' },
        { id: 'feeders', label: 'Distribution Feeders', path: '/grid-visualization/feeders' }
      ];
    case 'energy-analytics':
      return [
        { id: 'overview', label: 'Overview', path: '/energy-analytics' },
        { id: 'load', label: 'Load Analysis', path: '/energy-analytics/load' },
        { id: 'quality', label: 'Power Quality', path: '/energy-analytics/quality' },
        { id: 'trends', label: 'Trends & Forecasts', path: '/energy-analytics/trends' }
      ];
    case 'equipment-inventory':
      return [
        { id: 'all', label: 'All Equipment', path: '/equipment-inventory' },
        { id: 'transformers', label: 'Transformers', path: '/equipment-inventory/transformers' },
        { id: 'breakers', label: 'Circuit Breakers', path: '/equipment-inventory/breakers' },
        { id: 'feeders', label: 'Feeders', path: '/equipment-inventory/feeders' },
        { id: 'maintenance', label: 'Maintenance', path: '/equipment-inventory/maintenance' }
      ];
    case 'permit-to-work':
      return [
        { id: 'active', label: 'Active Permits', path: '/permit-to-work' },
        { id: 'pending', label: 'Pending Approval', path: '/permit-to-work/pending' },
        { id: 'completed', label: 'Completed', path: '/permit-to-work/completed' },
        { id: 'create', label: 'Create New', path: '/permit-to-work/create' }
      ];
    default:
      return [];
  }
}
