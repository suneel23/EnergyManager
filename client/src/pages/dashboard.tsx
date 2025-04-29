import { AppLayout } from "@/layouts/app-layout";
import { StatusOverview } from "@/components/dashboard/status-overview";
import { EnergyFlowChart } from "@/components/dashboard/energy-flow-chart";
import { CriticalAlerts } from "@/components/dashboard/critical-alerts";
import { QuickAccess } from "@/components/dashboard/quick-access";

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Status Cards */}
        <StatusOverview />
        
        {/* Energy Flow Charts */}
        <EnergyFlowChart />
        
        {/* Quick Access Section */}
        <QuickAccess />
      </div>
    </AppLayout>
  );
}
