import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SystemStatus } from "@/components/dashboard/system-status";
import { ActiveIssues } from "@/components/dashboard/active-issues";
import { WorkPermitCard } from "@/components/dashboard/work-permit-card";
import { EnergyFlowSummary } from "@/components/dashboard/energy-flow-summary";
import { EquipmentStatus } from "@/components/dashboard/equipment-status";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [_, setLocation] = useLocation();
  
  // Redirect to grid visualization page (primary view)
  useEffect(() => {
    setLocation("/grid-visualization");
  }, [setLocation]);
  
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
  });
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-lg font-medium text-error">Error loading dashboard data</h2>
          <p className="text-neutral-600">{(error as Error).message}</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4">
            {/* Main content area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SystemStatus />
              <div className="md:col-span-2">
                <ActiveIssues issues={dashboardData?.activeAlerts || []} />
              </div>
            </div>
            
            {/* Energy flow and status panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <EnergyFlowSummary />
              <EquipmentStatus 
                equipmentSummary={dashboardData?.equipmentSummary || {
                  transformers: { total: 0, online: 0, offline: 0 },
                  circuitBreakers: { total: 0, closed: 0, open: 0 },
                  feeders: { total: 0, normal: 0, warning: 0, fault: 0 },
                  maintenanceDue: 0
                }}
              />
              <RecentActivities activities={dashboardData?.recentActivity || []} />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {/* Side panel with work permits */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Active Work Permits</h2>
              {dashboardData?.activeWorkPermits && dashboardData.activeWorkPermits.length > 0 ? (
                dashboardData.activeWorkPermits.map(permit => (
                  <WorkPermitCard key={permit.id} workPermit={permit} />
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <p className="text-neutral-600">No active work permits</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
