import { AppLayout } from "@/layouts/app-layout";
import { StatusOverview } from "@/components/dashboard/status-overview";
import { EnergyFlowChart } from "@/components/dashboard/energy-flow-chart";
import { CriticalAlerts } from "@/components/dashboard/critical-alerts";
import { QuickAccess } from "@/components/dashboard/quick-access";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { Helmet } from "react-helmet";

export default function Dashboard() {
  return (
    <AppLayout>
      <Helmet>
        <title>Dashboard | Energy Management System</title>
      </Helmet>
      
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor real-time energy distribution and system performance
          </p>
        </div>
        
        {/* Status Cards */}
        <StatusOverview />
        
        {/* KPI Section */}
        <KpiSection />
        
        {/* Energy Flow Charts */}
        <EnergyFlowChart />
        
        {/* Critical Alerts Section */}
        <CriticalAlerts />
        
        {/* Quick Access Section */}
        <QuickAccess />
      </div>
    </AppLayout>
  );
}
