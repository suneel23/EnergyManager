import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Clock,
  Info,
  BarChartHorizontal,
  Check,
  XCircle,
  Settings,
  Share2,
  Printer
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Report interface
interface Report {
  id: string;
  title: string;
  type: "monthly" | "quarterly" | "annual" | "custom";
  category: "operational" | "commercial" | "financial" | "safety" | "compliance";
  period: {
    from: Date;
    to: Date;
  };
  status: "draft" | "published" | "scheduled";
  format: "pdf" | "excel" | "web";
  createdAt: Date;
  metrics: string[];
  description?: string;
  standard: "ISO-50001" | "IEC-61850" | "IEEE-1366" | "ISO-45001" | "IFRS" | "internal" | "custom";
}

interface Metric {
  id: string;
  name: string;
  category: string;
  frequency: "monthly" | "quarterly" | "yearly";
  unit: string;
  standard?: string;
  kpi?: boolean;
  description?: string;
}

export function ReportGenerator() {
  const [reportFormat, setReportFormat] = useState<"pdf" | "excel" | "web">("pdf");
  const [reportType, setReportType] = useState<"monthly" | "quarterly" | "annual" | "custom">("monthly");
  const [reportStandard, setReportStandard] = useState<"ISO-50001" | "IEC-61850" | "IEEE-1366" | "ISO-45001" | "IFRS" | "internal" | "custom">("ISO-50001");
  const [reportCategory, setReportCategory] = useState<"operational" | "commercial" | "financial" | "safety" | "compliance">("operational");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subMonths(startOfMonth(new Date()), 1),
    to: endOfMonth(subMonths(new Date(), 1)),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);
  
  // Query for available metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<Metric[]>({
    queryKey: ["/api/metrics"],
    queryFn: async () => {
      // In a real app, we would fetch metrics from the API
      return [
        {
          id: "saidi",
          name: "System Average Interruption Duration Index (SAIDI)",
          category: "commercial",
          frequency: "monthly",
          unit: "minutes",
          standard: "IEEE-1366",
          kpi: true,
          description: "Average duration of interruptions per consumer during the reporting period"
        },
        {
          id: "saifi",
          name: "System Average Interruption Frequency Index (SAIFI)",
          category: "commercial",
          frequency: "monthly",
          unit: "interruptions",
          standard: "IEEE-1366",
          kpi: true,
          description: "Average number of sustained interruptions per consumer during the reporting period"
        },
        {
          id: "caidi",
          name: "Customer Average Interruption Duration Index (CAIDI)",
          category: "commercial",
          frequency: "monthly",
          unit: "minutes/interruption",
          standard: "IEEE-1366",
          kpi: false,
          description: "Average duration of interruptions for affected consumers"
        },
        {
          id: "network-rehab",
          name: "Network Rehabilitated",
          category: "operational",
          frequency: "monthly",
          unit: "km",
          kpi: true,
          description: "Total kilometers of network rehabilitated during the period"
        },
        {
          id: "meters-installed",
          name: "Meters Installed",
          category: "operational",
          frequency: "monthly",
          unit: "number",
          kpi: true,
          description: "Total number of meters installed during the period"
        },
        {
          id: "revenue-collection",
          name: "Current Revenue Collection Rate",
          category: "commercial",
          frequency: "monthly",
          unit: "%",
          kpi: true,
          description: "Current collection rate of revenue billed during the reporting period"
        },
        {
          id: "unit-op-cost",
          name: "Unit Operational Cost",
          category: "financial",
          frequency: "monthly",
          unit: "TJD",
          standard: "ISO-50001",
          kpi: true,
          description: "Operational cost per kWh of electricity distributed to consumers"
        },
        {
          id: "sales-per-unit",
          name: "Sales per Unit of Product Sold",
          category: "financial",
          frequency: "monthly",
          unit: "TJD",
          kpi: true,
          description: "Average revenue from 1 kWh of electricity sold"
        },
        {
          id: "accidents-workers",
          name: "Number of accidents involving workers",
          category: "safety",
          frequency: "monthly",
          unit: "number",
          standard: "ISO-45001",
          kpi: true,
          description: "Total number of accidents involving workers during the reporting period"
        },
        {
          id: "accidents-public",
          name: "Number of accidents involving the public",
          category: "safety",
          frequency: "monthly",
          unit: "number",
          standard: "ISO-45001",
          kpi: true,
          description: "Total number of accidents involving the public during the reporting period"
        },
        {
          id: "asai",
          name: "Average System Availability Index",
          category: "operational",
          frequency: "quarterly",
          unit: "ratio",
          standard: "IEEE-1366",
          kpi: true,
          description: "Ratio of the total customer minutes that service was available to the total customer minutes demanded"
        },
        {
          id: "tech-losses",
          name: "Technical Distribution Losses",
          category: "operational",
          frequency: "yearly",
          unit: "%",
          standard: "IEC-61850",
          kpi: true,
          description: "Electricity losses in distribution lines"
        },
        {
          id: "non-tech-losses",
          name: "Commercial Distribution Losses",
          category: "commercial",
          frequency: "monthly",
          unit: "%",
          standard: "IEC-61850",
          kpi: true,
          description: "The difference between total distribution losses and technical distribution losses"
        },
        {
          id: "info-systems",
          name: "Modern Information Systems Introduced",
          category: "operational",
          frequency: "quarterly",
          unit: "number",
          kpi: true,
          description: "Number of modern information systems introduced"
        },
        {
          id: "receivables-age",
          name: "Average Age of Receivables",
          category: "commercial",
          frequency: "quarterly",
          unit: "days",
          kpi: true,
          description: "Accounts Receivable (by period) X 365 / Sales Revenue (by period)"
        },
        {
          id: "staff-ratio",
          name: "Staff to Customer Ratio",
          category: "commercial",
          frequency: "quarterly",
          unit: "ratio",
          kpi: true,
          description: "Number of Commercial Staff per period / Number of Residential Customers per period (Per 1000 customers)"
        },
        {
          id: "complaint-ratio",
          name: "Complaint to Customer Ratio",
          category: "commercial",
          frequency: "quarterly",
          unit: "ratio",
          kpi: true,
          description: "Number of Complaints filed per period / Number of Residential Customers per period (Per 1000 customers)"
        },
        {
          id: "liquidity-ratio",
          name: "Current Liquidity Ratio",
          category: "financial",
          frequency: "yearly",
          unit: "ratio",
          standard: "IFRS",
          kpi: true,
          description: "Effectiveness of working capital management"
        },
        {
          id: "debt-service",
          name: "Debt Service Coverage Ratio",
          category: "financial",
          frequency: "yearly",
          unit: "ratio",
          standard: "IFRS",
          kpi: true,
          description: "Financial capacity of the Company to pay both principal and interest"
        }
      ];
    },
    refetchOnWindowFocus: false,
  });

  // Query for existing reports
  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    queryFn: async () => {
      // In a real app, we would fetch reports from the API
      return [
        {
          id: "rep-2025-001",
          title: "Monthly Operational KPIs - March 2025",
          type: "monthly",
          category: "operational",
          period: {
            from: new Date(2025, 2, 1),
            to: new Date(2025, 2, 31),
          },
          status: "published",
          format: "pdf",
          createdAt: new Date(2025, 3, 5),
          metrics: ["network-rehab", "meters-installed"],
          description: "Standard monthly report of operational KPIs",
          standard: "internal"
        },
        {
          id: "rep-2025-002",
          title: "Quarterly Commercial Performance - Q1 2025",
          type: "quarterly",
          category: "commercial",
          period: {
            from: new Date(2025, 0, 1),
            to: new Date(2025, 2, 31),
          },
          status: "published",
          format: "excel",
          createdAt: new Date(2025, 3, 10),
          metrics: ["saidi", "saifi", "revenue-collection", "receivables-age"],
          description: "Quarterly analysis of commercial KPIs and performance metrics",
          standard: "IEEE-1366"
        },
        {
          id: "rep-2025-003",
          title: "Safety Metrics - April 2025",
          type: "monthly",
          category: "safety",
          period: {
            from: new Date(2025, 3, 1),
            to: new Date(2025, 3, 30),
          },
          status: "draft",
          format: "pdf",
          createdAt: new Date(2025, 4, 2),
          metrics: ["accidents-workers", "accidents-public"],
          description: "Monthly safety metrics report",
          standard: "ISO-45001"
        }
      ];
    },
    refetchOnWindowFocus: false,
  });

  const filteredMetrics = metrics?.filter(metric => {
    if (reportType === "monthly" && metric.frequency !== "monthly") {
      return false;
    }
    if (reportType === "quarterly" && metric.frequency === "yearly") {
      return false;
    }
    if (metric.category !== reportCategory) {
      return false;
    }
    if (reportStandard !== "custom" && reportStandard !== "internal" && metric.standard !== reportStandard) {
      return false;
    }
    return true;
  }) || [];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId) 
        : [...prev, metricId]
    );
  };

  const getReportPeriodDescription = () => {
    switch (reportType) {
      case "monthly":
        return `Monthly Report - ${format(dateRange.from, "MMMM yyyy")}`;
      case "quarterly":
        const quarter = Math.floor(dateRange.from.getMonth() / 3) + 1;
        return `Quarterly Report - Q${quarter} ${dateRange.from.getFullYear()}`;
      case "annual":
        return `Annual Report - ${dateRange.from.getFullYear()}`;
      case "custom":
        return `Custom Report - ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`;
      default:
        return "Report Period";
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // In a real implementation, this would be an API call to generate the report
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReportId = `rep-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      setGeneratedReportId(newReportId);
      
      // In a real app, we would refetch reports after generating
      setTimeout(() => {
        refetchReports();
        setIsGenerating(false);
      }, 500);
      
    } catch (error) {
      console.error("Error generating report:", error);
      setIsGenerating(false);
    }
  };

  const getStandardIcon = (standard: string) => {
    switch (standard) {
      case "ISO-50001":
        return <Badge variant="outline" className="mr-2">ISO 50001</Badge>;
      case "IEC-61850":
        return <Badge variant="outline" className="mr-2">IEC 61850</Badge>;
      case "IEEE-1366":
        return <Badge variant="outline" className="mr-2">IEEE 1366</Badge>;
      case "ISO-45001":
        return <Badge variant="outline" className="mr-2">ISO 45001</Badge>;
      case "IFRS":
        return <Badge variant="outline" className="mr-2">IFRS</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      default:
        return null;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <File className="h-4 w-4 mr-1" />;
      case "excel":
        return <FileSpreadsheet className="h-4 w-4 mr-1" />;
      case "web":
        return <FileText className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>
                Generate standardized reports based on KPIs and metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-title">Report Title</Label>
                    <Input 
                      id="report-title" 
                      placeholder="Enter report title" 
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select 
                      value={reportType} 
                      onValueChange={(value) => setReportType(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly Report</SelectItem>
                        <SelectItem value="quarterly">Quarterly Report</SelectItem>
                        <SelectItem value="annual">Annual Report</SelectItem>
                        <SelectItem value="custom">Custom Period</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-standard">Report Standard</Label>
                    <Select 
                      value={reportStandard} 
                      onValueChange={(value) => setReportStandard(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select report standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ISO-50001">ISO 50001 (Energy Management)</SelectItem>
                        <SelectItem value="IEC-61850">IEC 61850 (Power Utility Automation)</SelectItem>
                        <SelectItem value="IEEE-1366">IEEE 1366 (Reliability Indices)</SelectItem>
                        <SelectItem value="ISO-45001">ISO 45001 (Occupational Safety)</SelectItem>
                        <SelectItem value="IFRS">IFRS (Financial Reporting)</SelectItem>
                        <SelectItem value="internal">Internal Standard</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-format">Export Format</Label>
                    <Select 
                      value={reportFormat} 
                      onValueChange={(value) => setReportFormat(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="web">Web View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-period">Report Period</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="report-period"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {getReportPeriodDescription()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={(range) => {
                            if (range?.from && range.to) {
                              setDateRange({
                                from: range.from,
                                to: range.to
                              });
                            }
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-category">Metric Category</Label>
                    <Select 
                      value={reportCategory} 
                      onValueChange={(value) => setReportCategory(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-schedule">Schedule Generation</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="report-schedule"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {scheduledDate ? format(scheduledDate, "PPP") : "Schedule for later"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-description">Description</Label>
                    <Input 
                      id="report-description" 
                      placeholder="Brief description of the report"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="block mb-2">Select Metrics</Label>
                <Card>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[200px] pr-4">
                      <div className="space-y-4 pt-2">
                        {metricsLoading ? (
                          <div className="flex justify-center p-4">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        ) : filteredMetrics.length === 0 ? (
                          <div className="text-center text-muted-foreground p-4">
                            No metrics available for the selected criteria
                          </div>
                        ) : (
                          filteredMetrics.map((metric) => (
                            <div key={metric.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`metric-${metric.id}`} 
                                checked={selectedMetrics.includes(metric.id)}
                                onCheckedChange={() => handleMetricToggle(metric.id)}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <label
                                  htmlFor={`metric-${metric.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                                >
                                  {metric.name}
                                  {metric.kpi && <Badge className="ml-2 text-xs bg-blue-100 text-blue-800 border-blue-300">KPI</Badge>}
                                  {metric.standard && getStandardIcon(metric.standard)}
                                </label>
                                <p className="text-xs text-muted-foreground">{metric.description}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Preview</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Report Preview</DialogTitle>
                      <DialogDescription>
                        {getReportPeriodDescription()}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-8">
                          <div className="border-b pb-4">
                            <h2 className="text-2xl font-bold">{reportTitle || "Untitled Report"}</h2>
                            <p className="text-muted-foreground">{reportDescription || "No description provided"}</p>
                            <div className="flex mt-4 gap-2">
                              {getStandardIcon(reportStandard)}
                              <Badge>{reportCategory}</Badge>
                              <Badge variant="outline">{getReportPeriodDescription()}</Badge>
                            </div>
                          </div>
                          
                          {selectedMetrics.length === 0 ? (
                            <div className="text-center py-12">
                              <BarChartHorizontal className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <h3 className="text-lg font-medium">No metrics selected</h3>
                              <p className="text-muted-foreground">Please select metrics to include in this report</p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-lg font-medium mb-4">Executive Summary</h3>
                                <p className="text-muted-foreground">
                                  This report presents {selectedMetrics.length} key metrics for the {reportType} period
                                  from {format(dateRange.from, "MMMM d, yyyy")} to {format(dateRange.to, "MMMM d, yyyy")}.
                                  The report follows {reportStandard === "internal" ? "internal" : reportStandard} standards
                                  for {reportCategory} performance reporting.
                                </p>
                              </div>
                              
                              <div>
                                <h3 className="text-lg font-medium mb-4">Selected Metrics</h3>
                                <div className="space-y-4">
                                  {selectedMetrics.map(metricId => {
                                    const metric = metrics?.find(m => m.id === metricId);
                                    if (!metric) return null;
                                    
                                    return (
                                      <Card key={metric.id}>
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-base">{metric.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="h-[200px]">
                                            {/* Placeholder chart for preview */}
                                            <LineChart 
                                              data={{
                                                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].slice(0, 6),
                                                datasets: [
                                                  {
                                                    label: metric.name,
                                                    data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)),
                                                  }
                                                ],
                                                title: metric.name,
                                                yAxisLabel: metric.unit,
                                              }}
                                              height={200}
                                            />
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => {}}>
                        Export
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  onClick={generateReport} 
                  disabled={isGenerating || selectedMetrics.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Generating...
                    </>
                  ) : scheduledDate ? "Schedule Report" : "Generate Report"}
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {generatedReportId && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-700 flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Report Generated Successfully
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700">
                  Your report has been generated and is available in the Saved Reports tab.
                  Report ID: <span className="font-mono">{generatedReportId}</span>
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setGeneratedReportId(null)}>
                  Dismiss
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>
                Access and download previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : reports?.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No reports found</h3>
                  <p className="text-muted-foreground">Generate a new report to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports?.map((report) => (
                    <Card key={report.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{report.title}</CardTitle>
                            <CardDescription>
                              {report.description}
                            </CardDescription>
                          </div>
                          <div>
                            {getStatusBadge(report.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Period</p>
                            <p className="font-medium">
                              {format(new Date(report.period.from), "MMM d, yyyy")} - {format(new Date(report.period.to), "MMM d, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Standard</p>
                            <p className="font-medium flex items-center">
                              {getStandardIcon(report.standard)}
                              {report.standard}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Generated</p>
                            <p className="font-medium">
                              {format(new Date(report.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Badge variant="outline" className="mr-2">
                            {report.type}
                          </Badge>
                          <Badge variant="outline">
                            {report.category}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Share Report</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Print Report</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <Button variant="outline" className="flex items-center">
                            {getFormatIcon(report.format)}
                            Download
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button>View</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>{report.title}</DialogTitle>
                                <DialogDescription>
                                  {format(new Date(report.period.from), "MMMM d, yyyy")} - {format(new Date(report.period.to), "MMMM d, yyyy")}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <ScrollArea className="h-[500px] pr-4">
                                  <div className="space-y-8">
                                    <div className="border-b pb-4">
                                      <h2 className="text-2xl font-bold">{report.title}</h2>
                                      <p className="text-muted-foreground">{report.description}</p>
                                      <div className="flex mt-4 gap-2">
                                        {getStandardIcon(report.standard)}
                                        <Badge>{report.category}</Badge>
                                        <Badge variant="outline">{report.type}</Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                      <div>
                                        <h3 className="text-lg font-medium mb-4">Executive Summary</h3>
                                        <p className="text-muted-foreground">
                                          This report presents {report.metrics.length} key metrics for the {report.type} period
                                          from {format(new Date(report.period.from), "MMMM d, yyyy")} to {format(new Date(report.period.to), "MMMM d, yyyy")}.
                                          The report follows {report.standard === "internal" ? "internal" : report.standard} standards
                                          for {report.category} performance reporting.
                                        </p>
                                      </div>
                                      
                                      <div>
                                        <h3 className="text-lg font-medium mb-4">Metrics</h3>
                                        <div className="space-y-4">
                                          {report.metrics.map(metricId => {
                                            const metric = metrics?.find(m => m.id === metricId);
                                            if (!metric) return null;
                                            
                                            return (
                                              <Card key={metric.id}>
                                                <CardHeader className="pb-2">
                                                  <CardTitle className="text-base">{metric.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                  <div className="h-[200px]">
                                                    {/* Placeholder chart for preview */}
                                                    <LineChart 
                                                      data={{
                                                        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].slice(0, 6),
                                                        datasets: [
                                                          {
                                                            label: metric.name,
                                                            data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)),
                                                          }
                                                        ],
                                                        title: metric.name,
                                                        yAxisLabel: metric.unit,
                                                      }}
                                                      height={200}
                                                    />
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </ScrollArea>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => {}}>
                                  {getFormatIcon(report.format)}
                                  Download {report.format.toUpperCase()}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}