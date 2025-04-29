import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, BarChart, PieChart } from "@/components/ui/charts";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowRightIcon,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPI {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  frequency: "MONTHLY" | "QUARTERLY" | "YEARLY";
  category: "operational" | "commercial" | "financial" | "safety" | "other";
  target2024: string | number;
  target2025: string | number;
  target2026: string | number;
  target2027: string | number;
  baseline: string | number;
  trend: "up" | "down" | "stable";
  trendPercentage?: number;
  description?: string;
}

export function KPIDashboard() {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const { data: kpis, isLoading } = useQuery<KPI[]>({
    queryKey: ["/api/kpis"],
    queryFn: async () => {
      // In a real app, we would fetch from the API
      // For now, we'll use data based on the provided document
      return [
        // Operational Indicators (MONTHLY)
        {
          id: "nw-rehab",
          name: "Network Rehabilitated",
          value: 1280,
          unit: "KM",
          frequency: "MONTHLY",
          category: "operational",
          baseline: "As per the project plan",
          target2024: 5095,
          target2025: 1414,
          target2026: 612,
          target2027: 35,
          trend: "up",
          trendPercentage: 4.2,
          description: "Kilometers of network rehabilitated under projects including SIN0+CASA-1000+KHALON+RURAL ELECTRIFICATION-KHALON+KHATLON LOT-1+ STB Autumn winter plan"
        },
        {
          id: "meters-installed",
          name: "Meters Installed",
          value: 98450,
          unit: "NO",
          frequency: "MONTHLY",
          category: "operational",
          baseline: "As per the project plan + New connections",
          target2024: 400140,
          target2025: 172519,
          target2026: 165600,
          target2027: 10600,
          trend: "up",
          trendPercentage: 5.8,
          description: "Number of meters installed under STB+SINO+RE_KHALON+CASA-100+KHATLON LOT-1+ New connections"
        },
        
        // Commercial Indicators (MONTHLY)
        {
          id: "saifi",
          name: "System Average Interruption Frequency Index (SAIFI)",
          value: 0.97,
          unit: "NO",
          frequency: "MONTHLY",
          category: "commercial",
          baseline: "Not calculated in CY 2023",
          target2024: "Baseline will be established",
          target2025: "5% improvement YOY",
          target2026: "5% improvement YOY",
          target2027: "5% improvement YOY",
          trend: "down",
          trendPercentage: 3.1,
          description: "Average number of sustained interruptions per consumer during the year, or the ratio of the annual number of interruptions to the number of consumers"
        },
        {
          id: "saidi",
          name: "System Average Interruption Duration Index (SAIDI)",
          value: 122,
          unit: "MINUTES",
          frequency: "MONTHLY",
          category: "commercial",
          baseline: "Not calculated in CY 2023",
          target2024: "Baseline will be established",
          target2025: "5% improvement YOY",
          target2026: "5% improvement YOY",
          target2027: "5% improvement YOY",
          trend: "down",
          trendPercentage: 2.5,
          description: "Average duration of interruptions per consumer during the year, or the ratio of the annual duration of sustained interruptions to the number of consumers"
        },
        {
          id: "rev-collection",
          name: "Current Revenue Collection Rate",
          value: 92.4,
          unit: "%",
          frequency: "MONTHLY",
          category: "commercial",
          baseline: "88.8 (without 505 Mn offset)",
          target2024: 94.5,
          target2025: 95.2,
          target2026: 95.64,
          target2027: 96.31,
          trend: "up",
          trendPercentage: 1.8,
          description: "Current collection rate of revenue billed during a reporting period"
        },
        
        // Financial Indicators (MONTHLY)
        {
          id: "op-cost",
          name: "Unit Operational Cost",
          value: 21.85,
          unit: "TJD",
          frequency: "MONTHLY",
          category: "financial",
          baseline: 19.79,
          target2024: 22.40,
          target2025: 24.90,
          target2026: 27.70,
          target2027: 30.54,
          trend: "up",
          trendPercentage: 3.2,
          description: "Operational cost per kWh of electricity distributed to consumers (TJD/KWH)"
        },
        {
          id: "sales-unit",
          name: "Sales per Unit of Product Sold",
          value: 29.8,
          unit: "TJD",
          frequency: "MONTHLY",
          category: "financial",
          baseline: 26.7,
          target2024: 31.2,
          target2025: 35.5,
          target2026: 40.70,
          target2027: 45.6,
          trend: "up",
          trendPercentage: 2.7,
          description: "Average revenue from 1 kWh of electricity sold (All projections are indicative based on tariff trajectory indicated by the Ministry, not under the control of MC)"
        },
        
        // Safety Indicators (MONTHLY)
        {
          id: "accidents-workers",
          name: "Number of accidents involving workers",
          value: 2,
          unit: "NO",
          frequency: "MONTHLY",
          category: "safety",
          baseline: 6,
          target2024: 4,
          target2025: 3,
          target2026: 2,
          target2027: 1,
          trend: "down",
          trendPercentage: 33,
          description: "Total number of accidents involving workers during the reporting period"
        },
        {
          id: "accidents-public",
          name: "Number of accidents involving the public",
          value: 0,
          unit: "NO",
          frequency: "MONTHLY",
          category: "safety",
          baseline: 1,
          target2024: 0,
          target2025: 0,
          target2026: 0,
          target2027: 0,
          trend: "stable",
          trendPercentage: 0,
          description: "Total number of accidents involving the public during the reporting period"
        },
        
        // Other KPIs (QUARTERLY / YEARLY)
        {
          id: "asai",
          name: "Average System Availability Index (ASAI)",
          value: 0.968,
          unit: "RATIO",
          frequency: "QUARTERLY",
          category: "other",
          baseline: "Not calculated in CY 2023",
          target2024: "Baseline will be established in 2024",
          target2025: "5% improvement from the previous year",
          target2026: "5% improvement from the previous year",
          target2027: "5% improvement from the previous year",
          trend: "up",
          trendPercentage: 1.2,
          description: "Ratio of the total customer minutes that service was available to the total customer minutes demanded in a period"
        },
        {
          id: "tech-losses",
          name: "Technical Distribution Losses",
          value: 18.45,
          unit: "%",
          frequency: "YEARLY",
          category: "other",
          baseline: "Power Loss (incl Technical & Commercial losses) Baseline Sep 22- Dec 23 provided in the Baseline Report",
          target2024: 19.02,
          target2025: 16.21,
          target2026: 15.16,
          target2027: 14.08,
          trend: "down",
          trendPercentage: 1.5,
          description: "Electricity losses in distribution lines in %. Currently calculated together with commercial losses as STB does not have energy balance meters on each distribution transformer and feeder."
        },
        {
          id: "non-tech-losses",
          name: "Commercial (Non-Technical) Distribution Losses",
          value: "Not Available",
          unit: "%",
          frequency: "MONTHLY",
          category: "commercial",
          baseline: "Not Calculated Separately",
          target2024: "Not Available",
          target2025: "Not Available",
          target2026: "Not Available",
          target2027: "Not Available",
          trend: "stable",
          trendPercentage: 0,
          description: "The difference between total distribution losses and technical distribution losses. Currently not calculated separately due to metering limitations."
        },
        {
          id: "modern-systems",
          name: "Modern Information Systems Introduced",
          value: 1,
          unit: "NO",
          frequency: "QUARTERLY",
          category: "other",
          baseline: "NIL",
          target2024: "1 Email system for STB",
          target2025: "2 Customer portal on Website",
          target2026: "3 Combined billing system",
          target2027: "4 ERP – 1C for HR/Store/Purchase",
          trend: "up",
          trendPercentage: 100,
          description: "Number and description of modern information systems introduced over the life of the Contract to date. Includes website updates, email configuration, and 1C software implementation."
        },
        {
          id: "receivables-age",
          name: "Average Age of Receivables",
          value: 280.5,
          unit: "DAYS",
          frequency: "QUARTERLY",
          category: "commercial",
          baseline: "388.4*",
          target2024: "262.3*",
          target2025: "216.3*",
          target2026: "163.3*",
          target2027: "147.1*",
          trend: "down",
          trendPercentage: 5.2,
          description: "Accounts Receivable (by period) X 365 / Sales Revenue (by period). *Includes old/disputed arrears from Barki Tojik, estimated at 2.1 Bn TJS at end of 2023."
        },
        {
          id: "staff-customer-ratio",
          name: "Staff to Customer Ratio",
          value: 1.67,
          unit: "RATIO",
          frequency: "QUARTERLY",
          category: "commercial",
          baseline: "1.687",
          target2024: "1.653",
          target2025: "1.620",
          target2026: "1.587",
          target2027: "1.556",
          trend: "down",
          trendPercentage: 1.0,
          description: "Number of Commercial Staff per period / Number of Residential Customers per period (Per 1000 customers)"
        },
        {
          id: "complaint-ratio",
          name: "Complaint to Customer Ratio",
          value: "Not Applicable",
          unit: "RATIO",
          frequency: "QUARTERLY",
          category: "commercial",
          baseline: "Not Applicable",
          target2024: "Baseline to be established basis new Call Centers",
          target2025: "2% improvement over previous year",
          target2026: "2% improvement over previous year",
          target2027: "2% improvement over previous year",
          trend: "stable",
          trendPercentage: 0,
          description: "Number of Complaints filed per period / Number of Residential Customers per period (Per 1000 customers)"
        },
        {
          id: "liquidity-ratio",
          name: "Current Liquidity Ratio",
          value: 0.85,
          unit: "RATIO",
          frequency: "YEARLY",
          category: "financial",
          baseline: "0.95",
          target2024: "0.72",
          target2025: "0.99",
          target2026: "1.81",
          target2027: "2.11",
          trend: "down",
          trendPercentage: 10.5,
          description: "Effectiveness of working capital management. Calculated on annual basis."
        },
        {
          id: "debt-service",
          name: "Debt Service Coverage Ratio",
          value: "Not calculated",
          unit: "RATIO",
          frequency: "YEARLY",
          category: "financial",
          baseline: "Not calculated",
          target2024: "5.12",
          target2025: "6.12",
          target2026: "14.32",
          target2027: "14.93",
          trend: "stable",
          trendPercentage: 0,
          description: "Financial capacity of the Company to pay both principal and interest. Calculated on annual basis."
        }
      ];
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const filteredKPIs = kpis?.filter(kpi => 
    activeTab === "all" || 
    activeTab === kpi.category || 
    activeTab === kpi.frequency.toLowerCase()
  ) || [];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpIcon className="h-4 w-4 text-emerald-500" />;
      case "down":
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      case "stable":
        return <ArrowRightIcon className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };
  
  const getTrendClass = (trend: string, isPositive: boolean = true) => {
    if (trend === "up") {
      return isPositive ? "text-emerald-600" : "text-red-600";
    } else if (trend === "down") {
      return isPositive ? "text-red-600" : "text-emerald-600";
    }
    return "text-amber-600";
  };

  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
          <CardDescription>Loading KPIs...</CardDescription>
        </CardHeader>
        <CardContent className="h-[450px] flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate chart data for monthly KPIs
  const monthlyKPIs = filteredKPIs.filter(kpi => kpi.frequency === "MONTHLY");
  const monthlyKPIChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Actual",
        data: [89, 92, 90, 93, 88, 92, 94, 90, 91, 94, 92, 93],
      },
      {
        label: "Target",
        data: [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90],
      },
    ],
    title: "Monthly KPI Performance (Average)",
    yAxisLabel: "Performance (%)",
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>Key Performance Indicators</CardTitle>
          <CardDescription>
            Tracking essential metrics with defined reporting frequencies
          </CardDescription>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export Report</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto">
            <TabsTrigger value="all">All KPIs</TabsTrigger>
            <TabsTrigger value="operational">Operational</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly+</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredKPIs.map((kpi) => (
                <Card key={kpi.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1">
                          <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                          {kpi.description && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-xs">
                                  {kpi.description}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Badge variant="outline" className="text-xs font-normal">
                            {kpi.frequency}
                          </Badge>
                          <Badge variant="secondary" className="text-xs font-normal">
                            {kpi.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-end space-x-2 mt-2">
                      <span className="text-2xl font-bold">{kpi.value}</span>
                      <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                      {kpi.trend && kpi.trendPercentage && (
                        <span className={`text-xs flex items-center ${getTrendClass(kpi.trend, kpi.category !== "safety")}`}>
                          {getTrendIcon(kpi.trend)}
                          {kpi.trendPercentage}%
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      <div className="grid grid-cols-5 gap-1">
                        <div className="col-span-1">Baseline:</div>
                        <div className="col-span-4 font-medium">{kpi.baseline}</div>
                        
                        <div className="col-span-1">2024:</div>
                        <div className="col-span-4 font-medium">{kpi.target2024}</div>
                        
                        <div className="col-span-1">2025:</div>
                        <div className="col-span-4 font-medium">{kpi.target2025}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {activeTab === "all" || activeTab === "monthly" ? (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Performance Trends (Monthly KPIs)</CardTitle>
                  <CardDescription>
                    Tracking key metrics over time against targets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <LineChart data={monthlyKPIChartData} />
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}