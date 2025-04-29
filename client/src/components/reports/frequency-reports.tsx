import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Download, 
  FileText, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Info,
  Filter,
  BarChart3
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LineChart, BarChart } from "@/components/ui/charts";
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
  historicalData?: {
    time: string;
    value: number;
  }[];
}

export function FrequencyReports() {
  const [activeTab, setActiveTab] = useState<string>("monthly");
  const [reportView, setReportView] = useState<"table" | "chart">("table");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { t } = useLanguage();

  const { data: kpis, isLoading } = useQuery<KPI[]>({
    queryKey: ["/api/kpis/frequency-reports"],
    queryFn: async () => {
      // In a real app, we would fetch from the API with all historical data
      // For demo purposes, let's create a simplified version
      
      // Generate some dummy historical data for time periods
      const generateHistory = (baseline: number, fluctuation: number, periods: number) => {
        return Array.from({ length: periods }).map((_, i) => {
          let periodValue = baseline + ((Math.random() - 0.5) * fluctuation);
          // Add some trend
          if (i > periods / 2) {
            periodValue = periodValue * (1 + (i - periods/2) * 0.05);
          }
          return {
            time: i.toString(),
            value: parseFloat(periodValue.toFixed(2)),
          };
        });
      };
      
      return [
        // Monthly KPIs - just a sample from the full list
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
          description: "Kilometers of network rehabilitated under projects including SIN0+CASA-1000+KHALON+RURAL ELECTRIFICATION-KHALON+KHATLON LOT-1+ STB Autumn winter plan",
          historicalData: generateHistory(1200, 400, 12)
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
          description: "Number of meters installed under STB+SINO+RE_KHALON+CASA-100+KHATLON LOT-1+ New connections",
          historicalData: generateHistory(90000, 20000, 12)
        },
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
          description: "Average number of sustained interruptions per consumer during the year, or the ratio of the annual number of interruptions to the number of consumers",
          historicalData: generateHistory(1.0, 0.2, 12)
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
          description: "Average duration of interruptions per consumer during the year, or the ratio of the annual duration of sustained interruptions to the number of consumers",
          historicalData: generateHistory(125, 30, 12)
        },
        
        // Quarterly KPIs - sample
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
          description: "Ratio of the total customer minutes that service was available to the total customer minutes demanded in a period",
          historicalData: generateHistory(0.95, 0.05, 4)
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
          description: "Accounts Receivable (by period) X 365 / Sales Revenue (by period). *Includes old/disputed arrears from Barki Tojik, estimated at 2.1 Bn TJS at end of 2023.",
          historicalData: generateHistory(290, 40, 4)
        },
        
        // Yearly KPIs - sample
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
          description: "Electricity losses in distribution lines in %. Currently calculated together with commercial losses as STB does not have energy balance meters on each distribution transformer and feeder.",
          historicalData: generateHistory(19, 2, 3)
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
          description: "Effectiveness of working capital management. Calculated on annual basis.",
          historicalData: generateHistory(0.9, 0.15, 3)
        }
      ];
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const filteredKPIs = kpis?.filter(
    (kpi) => 
      kpi.frequency.toLowerCase() === activeTab &&
      (selectedCategory === "all" || kpi.category === selectedCategory)
  ) || [];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
      case "down":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case "stable":
        return <ArrowRight className="h-4 w-4 text-amber-500" />;
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

  const getTimeLabels = () => {
    switch (activeTab) {
      case "monthly":
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      case "quarterly":
        return ["Q1", "Q2", "Q3", "Q4"];
      case "yearly":
        return ["2023", "2024", "2025"];
      default:
        return [];
    }
  };

  // Prepare chart data
  const getChartData = (kpi: KPI) => {
    if (!kpi.historicalData) {
      return {
        labels: [],
        datasets: [{ label: "", data: [] }],
      };
    }

    return {
      labels: getTimeLabels(),
      datasets: [
        {
          label: kpi.name,
          data: kpi.historicalData.map(d => d.value),
        }
      ],
      title: `${kpi.name} (${kpi.unit})`,
      yAxisLabel: kpi.unit
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('kpi_reports')}</CardTitle>
          <CardDescription>{t('loading')}...</CardDescription>
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <div>
          <CardTitle>{t('kpi_reports')}</CardTitle>
          <CardDescription>
            {t('view')} {t('reports')}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md p-0.5 bg-muted/20">
            <Button
              variant={reportView === "table" ? "secondary" : "ghost"}
              size="sm"
              className="px-2"
              onClick={() => setReportView("table")}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant={reportView === "chart" ? "secondary" : "ghost"}
              size="sm"
              className="px-2"
              onClick={() => setReportView("chart")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" className="flex gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t('export')}</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          defaultValue="monthly" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="monthly" className="flex-1 max-w-[150px]">{t('monthly')}</TabsTrigger>
            <TabsTrigger value="quarterly" className="flex-1 max-w-[150px]">{t('quarterly')}</TabsTrigger>
            <TabsTrigger value="yearly" className="flex-1 max-w-[150px]">{t('yearly')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {reportView === "table" ? (
              <Table>
                <TableCaption>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} KPI Report for {selectedYear}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">KPI Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Target {selectedYear}</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                    <TableHead className="text-center">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKPIs.map((kpi) => (
                    <TableRow key={kpi.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <span>{kpi.name}</span>
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
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {kpi.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {kpi.value} {kpi.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {selectedYear === "2024" && kpi.target2024}
                        {selectedYear === "2025" && kpi.target2025}
                        {selectedYear === "2026" && kpi.target2026}
                        {selectedYear === "2027" && kpi.target2027}
                        {kpi.unit && kpi.unit !== "NO" && ` ${kpi.unit}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center ${getTrendClass(kpi.trend, kpi.category !== "safety")}`}>
                          {getTrendIcon(kpi.trend)}
                          {kpi.trendPercentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-screen-md">
                            <DialogHeader>
                              <DialogTitle>{kpi.name}</DialogTitle>
                              <DialogDescription>
                                {kpi.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="h-[350px]">
                                {kpi.historicalData && (
                                  <LineChart data={getChartData(kpi)} />
                                )}
                              </div>
                              <div className="mt-4 grid grid-cols-3 gap-3">
                                <Card>
                                  <CardHeader className="py-2 px-3">
                                    <CardTitle className="text-sm font-medium">Baseline</CardTitle>
                                  </CardHeader>
                                  <CardContent className="py-2 px-3">
                                    <p className="text-sm">{kpi.baseline}</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader className="py-2 px-3">
                                    <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                                  </CardHeader>
                                  <CardContent className="py-2 px-3">
                                    <p className="text-sm">{kpi.value} {kpi.unit}</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader className="py-2 px-3">
                                    <CardTitle className="text-sm font-medium">Target {selectedYear}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="py-2 px-3">
                                    <p className="text-sm">
                                      {selectedYear === "2024" && kpi.target2024}
                                      {selectedYear === "2025" && kpi.target2025}
                                      {selectedYear === "2026" && kpi.target2026}
                                      {selectedYear === "2027" && kpi.target2027}
                                      {kpi.unit && kpi.unit !== "NO" && ` ${kpi.unit}`}
                                    </p>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {filteredKPIs.map((kpi) => (
                  <Card key={kpi.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">
                          {kpi.name}
                        </CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {kpi.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{kpi.value}</span>
                          <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                        </div>
                        <span className={`inline-flex items-center ${getTrendClass(kpi.trend, kpi.category !== "safety")}`}>
                          {getTrendIcon(kpi.trend)}
                          {kpi.trendPercentage}%
                        </span>
                      </div>
                      <div className="h-[180px] mt-4">
                        {kpi.historicalData && (
                          <LineChart data={getChartData(kpi)} height={180} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}