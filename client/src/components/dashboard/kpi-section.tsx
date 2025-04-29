import React from "react";
import { KpiCard } from "./kpi-card";
import { useQuery } from "@tanstack/react-query";
import { 
  Activity, 
  AlertTriangle, 
  Battery, 
  ZapOff, 
  Cpu, 
  Gauge, 
  Lightbulb, 
  Thermometer, 
  Timer, 
  Zap 
} from "lucide-react";

interface KPIData {
  systemReliability: {
    value: number;
    trend: number;
  };
  energyEfficiency: {
    value: number;
    trend: number;
  };
  powerQuality: {
    value: number;
    trend: number;
  };
  outageFrequency: {
    value: number;
    trend: number;
  };
  responseTime: {
    value: number;
    trend: number;
  };
  maintenanceRatio: {
    value: number;
    trend: number;
  };
  assetUtilization: {
    value: number;
    trend: number;
  };
  peakLoadFactor: {
    value: number;
    trend: number;
  };
  alertResolutionRate: {
    value: number;
    trend: number;
  };
  temperatureVariance: {
    value: number;
    trend: number;
  };
}

export function KpiSection() {
  // Fetch KPI data
  const { data: kpiData, isLoading, error } = useQuery<KPIData>({
    queryKey: ["/api/kpi/dashboard"],
    queryFn: async () => {
      // For demo purposes, generate mock data
      // In a real app, this would be an API call to fetch actual data
      const mockData: KPIData = {
        systemReliability: {
          value: 99.7,
          trend: 0.5,
        },
        energyEfficiency: {
          value: 87.4,
          trend: 2.3,
        },
        powerQuality: {
          value: 95.2,
          trend: -0.8,
        },
        outageFrequency: {
          value: 3,
          trend: -15.0,
        },
        responseTime: {
          value: 4.2,
          trend: -12.5,
        },
        maintenanceRatio: {
          value: 82.5,
          trend: 3.2,
        },
        assetUtilization: {
          value: 78.3,
          trend: 4.1,
        },
        peakLoadFactor: {
          value: 0.83,
          trend: 1.2,
        },
        alertResolutionRate: {
          value: 91.7,
          trend: 5.3,
        },
        temperatureVariance: {
          value: 2.4,
          trend: -5.8,
        }
      };
      return mockData;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error loading KPI data: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          title="System Reliability"
          value={`${kpiData?.systemReliability.value ?? "—"}%`}
          description="Uptime percentage over the last 30 days"
          icon={Activity}
          iconColor="text-blue-600"
          trend={kpiData ? {
            value: kpiData.systemReliability.trend,
            isPositive: kpiData.systemReliability.trend > 0,
            label: "vs last month"
          } : undefined}
          isLoading={isLoading}
        />
        
        <KpiCard
          title="Energy Efficiency"
          value={`${kpiData?.energyEfficiency.value ?? "—"}%`}
          description="Average energy conversion efficiency"
          icon={Zap}
          iconColor="text-green-600"
          trend={kpiData ? {
            value: kpiData.energyEfficiency.trend,
            isPositive: kpiData.energyEfficiency.trend > 0,
            label: "vs last month"
          } : undefined}
          isLoading={isLoading}
        />
        
        <KpiCard
          title="Power Quality"
          value={`${kpiData?.powerQuality.value ?? "—"}%`}
          description="Harmonic distortion and stability rating"
          icon={Gauge}
          iconColor="text-purple-600"
          trend={kpiData ? {
            value: kpiData.powerQuality.trend,
            isPositive: kpiData.powerQuality.trend > 0,
            label: "vs last month"
          } : undefined}
          isLoading={isLoading}
        />
        
        <KpiCard
          title="Outage Frequency"
          value={kpiData?.outageFrequency.value ?? "—"}
          description="Number of outages in last 30 days"
          icon={ZapOff}
          iconColor="text-orange-600"
          trend={kpiData ? {
            value: kpiData.outageFrequency.trend,
            isPositive: kpiData.outageFrequency.trend < 0, // Negative trend is good
            label: "vs last month"
          } : undefined}
          isLoading={isLoading}
        />
        
        <KpiCard
          title="Response Time"
          value={`${kpiData?.responseTime.value ?? "—"} min`}
          description="Average time to respond to alerts"
          icon={Timer}
          iconColor="text-red-600"
          trend={kpiData ? {
            value: kpiData.responseTime.trend,
            isPositive: kpiData.responseTime.trend < 0, // Negative trend is good
            label: "vs last month"
          } : undefined}
          isLoading={isLoading}
        />
        
        <KpiCard
          title="Maintenance Ratio"
          value={`${kpiData?.maintenanceRatio.value ?? "—"}%`}
          description="Preventive vs. corrective maintenance"
          icon={Cpu}
          iconColor="text-indigo-600"
          trend={kpiData ? {
            value: kpiData.maintenanceRatio.trend,
            isPositive: kpiData.maintenanceRatio.trend > 0,
            label: "vs last month"
          } : undefined}
          isLoading={isLoading}
        />
        
        <KpiCard
          title="Asset Utilization"
          value={`${kpiData?.assetUtilization.value ?? "—"}%`}
          description="Average equipment utilization rate"
          icon={Battery}
          iconColor="text-emerald-600"
          trend={kpiData ? {
            value: kpiData.assetUtilization.trend,
            isPositive: kpiData.assetUtilization.trend > 0,
            label: "vs last month"
          } : undefined}
          isLoading={isLoading}
        />
        
        <KpiCard
          title="Peak Load Factor"
          value={kpiData?.peakLoadFactor.value ?? "—"}
          description="Ratio of peak to average load demand"
          icon={Lightbulb}
          iconColor="text-amber-600"
          trend={kpiData ? {
            value: kpiData.peakLoadFactor.trend,
            isPositive: kpiData.peakLoadFactor.trend > 0,
            label: "vs last month"
          } : undefined}
          isLoading={isLoading}
        />
        
        <KpiCard
          title="Alert Resolution"
          value={`${kpiData?.alertResolutionRate.value ?? "—"}%`}
          description="Percentage of alerts resolved within SLA"
          icon={AlertTriangle}
          iconColor="text-teal-600"
          trend={kpiData ? {
            value: kpiData.alertResolutionRate.trend,
            isPositive: kpiData.alertResolutionRate.trend > 0,
            label: "vs last month"
          } : undefined}
          isLoading={isLoading}
        />
        
        <KpiCard
          title="Temperature Variance"
          value={`±${kpiData?.temperatureVariance.value ?? "—"}°C`}
          description="Equipment temperature stability"
          icon={Thermometer}
          iconColor="text-rose-600"
          trend={kpiData ? {
            value: kpiData.temperatureVariance.trend,
            isPositive: kpiData.temperatureVariance.trend < 0, // Lower variance is better
            label: "vs last month"
          } : undefined}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}