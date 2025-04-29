import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LineChart, BarChart, AreaChart, PieChart } from "@/components/ui/charts";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";

// Mock data interfaces
interface PerformanceMetric {
  date: string;
  value: number;
  category?: string;
}

interface MetricDatasets {
  efficiency: PerformanceMetric[];
  reliability: PerformanceMetric[];
  load: PerformanceMetric[];
  powerQuality: PerformanceMetric[];
  responsiveness: PerformanceMetric[];
  energyLoss: PerformanceMetric[];
  costPerKwh: PerformanceMetric[];
  emissionsEquivalent: PerformanceMetric[];
  assetLifecycle: PerformanceMetric[];
  loadDistribution: PerformanceMetric[];
}

export function PerformanceMetrics() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  
  const [activeTab, setActiveTab] = useState("efficiency");
  const [chartType, setChartType] = useState<"line" | "bar" | "area" | "pie">("line");

  const { data, isLoading, error } = useQuery<MetricDatasets>({
    queryKey: [
      "/api/analytics/performance",
      dateRange.from.toISOString(),
      dateRange.to.toISOString(),
    ],
    queryFn: async () => {
      // In a real app, this would be a fetch to the API
      // Generating dummy data for demo purposes
      const startDate = dateRange.from;
      const endDate = dateRange.to;
      const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const generateData = (baseValue: number, volatility: number): PerformanceMetric[] => {
        return Array.from({ length: dayDiff + 1 }).map((_, index) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + index);
          
          let value = baseValue + (Math.random() - 0.5) * volatility;
          // Add some trends
          value += (index / dayDiff) * (Math.random() > 0.5 ? 5 : -3);
          
          return {
            date: date.toISOString().split('T')[0],
            value: parseFloat(value.toFixed(2)),
          };
        });
      };
      
      // Generate data for load distribution with categories
      const loadDistribution = [
        { date: "Current", value: 35, category: "Industrial" },
        { date: "Current", value: 25, category: "Commercial" },
        { date: "Current", value: 20, category: "Residential" },
        { date: "Current", value: 15, category: "Infrastructure" },
        { date: "Current", value: 5, category: "Other" },
      ];
      
      return {
        efficiency: generateData(85, 10),
        reliability: generateData(99.5, 1),
        load: generateData(750, 150),
        powerQuality: generateData(92, 8),
        responsiveness: generateData(4.5, 2),
        energyLoss: generateData(8, 4),
        costPerKwh: generateData(0.12, 0.04),
        emissionsEquivalent: generateData(120, 40),
        assetLifecycle: generateData(7.5, 2),
        loadDistribution,
      };
    },
    refetchOnWindowFocus: false,
  });

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Loading metrics...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[200px]" />
          </div>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Metrics</CardTitle>
          <CardDescription>
            There was a problem loading the performance metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
            {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data based on the active tab
  const getChartData = () => {
    if (!data) return { labels: [], datasets: [] };
    
    let chartData: PerformanceMetric[] = [];
    let chartTitle = "";
    let yAxisLabel = "";
    
    switch (activeTab) {
      case "efficiency":
        chartData = data.efficiency;
        chartTitle = "Energy Efficiency";
        yAxisLabel = "Efficiency (%)";
        break;
      case "reliability":
        chartData = data.reliability;
        chartTitle = "System Reliability";
        yAxisLabel = "Uptime (%)";
        break;
      case "load":
        chartData = data.load;
        chartTitle = "Load Distribution";
        yAxisLabel = "Load (kW)";
        break;
      case "powerQuality":
        chartData = data.powerQuality;
        chartTitle = "Power Quality";
        yAxisLabel = "Quality Index (%)";
        break;
      case "responsiveness":
        chartData = data.responsiveness;
        chartTitle = "System Responsiveness";
        yAxisLabel = "Response Time (min)";
        break;
      case "energyLoss":
        chartData = data.energyLoss;
        chartTitle = "Energy Losses";
        yAxisLabel = "Loss (%)";
        break;
      case "costPerKwh":
        chartData = data.costPerKwh;
        chartTitle = "Cost Per kWh";
        yAxisLabel = "Cost ($)";
        break;
      case "emissionsEquivalent":
        chartData = data.emissionsEquivalent;
        chartTitle = "Emissions Equivalent";
        yAxisLabel = "CO2 (kg)";
        break;
      case "assetLifecycle":
        chartData = data.assetLifecycle;
        chartTitle = "Asset Lifecycle";
        yAxisLabel = "Years";
        break;
      case "loadDistribution":
        chartData = data.loadDistribution;
        chartTitle = "Load Distribution by Sector";
        yAxisLabel = "Percentage (%)";
        break;
      default:
        chartData = data.efficiency;
        chartTitle = "Energy Efficiency";
        yAxisLabel = "Efficiency (%)";
    }
    
    // Special case for pie chart
    if (activeTab === "loadDistribution") {
      return {
        labels: chartData.map(item => item.category),
        datasets: [
          {
            label: "Distribution",
            data: chartData.map(item => item.value),
          },
        ],
        title: chartTitle,
        yAxisLabel,
      };
    }
    
    // Line, bar, area charts
    return {
      labels: chartData.map(item => item.date),
      datasets: [
        {
          label: chartTitle,
          data: chartData.map(item => item.value),
        },
      ],
      title: chartTitle,
      yAxisLabel,
    };
  };
  
  const chartData = getChartData();
  
  // Render the appropriate chart based on user selection
  const renderChart = () => {
    if (activeTab === "loadDistribution") {
      return <PieChart data={chartData} />;
    }
    
    switch (chartType) {
      case "line":
        return <LineChart data={chartData} />;
      case "bar":
        return <BarChart data={chartData} />;
      case "area":
        return <AreaChart data={chartData} />;
      case "pie":
        return <PieChart data={chartData} />;
      default:
        return <LineChart data={chartData} />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Detailed analytics of system performance over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => range && setDateRange(range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            {activeTab !== "loadDistribution" && (
              <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line" className="flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4" />
                    <span>Line Chart</span>
                  </SelectItem>
                  <SelectItem value="bar" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Bar Chart</span>
                  </SelectItem>
                  <SelectItem value="area" className="flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4" />
                    <span>Area Chart</span>
                  </SelectItem>
                  <SelectItem value="pie" className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4" />
                    <span>Pie Chart</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs 
          defaultValue="efficiency" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 h-auto">
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            <TabsTrigger value="reliability">Reliability</TabsTrigger>
            <TabsTrigger value="load">Load</TabsTrigger>
            <TabsTrigger value="powerQuality">Power Quality</TabsTrigger>
            <TabsTrigger value="responsiveness">Response Time</TabsTrigger>
            <TabsTrigger value="energyLoss">Energy Loss</TabsTrigger>
            <TabsTrigger value="costPerKwh">Cost/kWh</TabsTrigger>
            <TabsTrigger value="emissionsEquivalent">Emissions</TabsTrigger>
            <TabsTrigger value="assetLifecycle">Asset Lifecycle</TabsTrigger>
            <TabsTrigger value="loadDistribution">Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <div className="h-[400px] w-full">
              {renderChart()}
            </div>
            
            <div className="bg-muted/40 p-4 rounded-md">
              <h3 className="font-medium mb-2">{chartData.title} Analysis</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === "efficiency" && "Energy efficiency measures how effectively the system converts energy inputs into useful outputs. Higher percentages indicate better performance with less waste."}
                {activeTab === "reliability" && "System reliability tracks uptime and availability. A higher percentage indicates fewer outages and more consistent service."}
                {activeTab === "load" && "Load metrics show power consumption patterns over time, helping identify peak usage periods and capacity planning needs."}
                {activeTab === "powerQuality" && "Power quality measures the stability of electrical supply, tracking factors like harmonic distortion and voltage stability."}
                {activeTab === "responsiveness" && "System responsiveness shows how quickly the system reacts to changes or recovers from issues. Lower times indicate better performance."}
                {activeTab === "energyLoss" && "Energy loss metrics track where power is lost during transmission and distribution. Lower percentages indicate a more efficient system."}
                {activeTab === "costPerKwh" && "Cost per kilowatt-hour shows the economic efficiency of energy generation and distribution over time."}
                {activeTab === "emissionsEquivalent" && "Emissions equivalent tracks the environmental impact of energy generation and distribution in terms of CO2 equivalent."}
                {activeTab === "assetLifecycle" && "Asset lifecycle metrics show the expected and actual operational lifespans of equipment components in the system."}
                {activeTab === "loadDistribution" && "Load distribution by sector shows how energy consumption is divided among different types of users and applications."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}