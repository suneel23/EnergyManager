import React, { useState } from "react";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { TopNavigation } from "@/components/layout/top-navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Should be handled by ProtectedRoute
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-neutral-100">
      {/* Sidebar */}
      <SidebarNavigation 
        isOpen={isSidebarOpen} 
        closeSidebar={() => setIsSidebarOpen(false)} 
        user={user}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation 
          toggleSidebar={toggleSidebar} 
          user={user}
          pageTitle="Dashboard" // Will be overridden by the actual page title
        />
        
        <main className="flex-1 overflow-y-auto bg-neutral-100">
          {children}
        </main>
      </div>
    </div>
  );
}
