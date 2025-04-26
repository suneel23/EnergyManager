import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from "recharts";
import { 
  Loader2, 
  Download, 
  BarChart2, 
  PieChart as PieChartIcon, 
  Activity, 
  FileText, 
  Calendar, 
  Filter, 
  RefreshCw,
  Printer
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ActivityLog, Alert, WorkPermit } from "@shared/schema";

// Sample data for charts (would be replaced with API data in production)
const equipmentStatusData = [
  { name: 'Operational', value: 36 },
  { name: 'Maintenance', value: 3 },
  { name: 'Warning', value: 2 },
  { name: 'Fault', value: 1 }
];

const COLORS = ['#388E3C', '#0288D1', '#FFA000', '#D32F2F'];

const reliabilityTrendData = [
  { month: 'Jan', saidi: 5.1, saifi: 0.3 },
  { month: 'Feb', saidi: 7.3, saifi: 0.5 },
  { month: 'Mar', saidi: 4.2, saifi: 0.2 },
  { month: 'Apr', saidi: 6.8, saifi: 0.4 },
  { month: 'May', saidi: 3.9, saifi: 0.2 },
  { month: 'Jun', saidi: 8.1, saifi: 0.6 }
];

const workPermitStatusData = [
  { name: 'Completed', value: 15 },
  { name: 'In Progress', value: 4 },
  { name: 'Pending', value: 7 },
  { name: 'Rejected', value: 2 }
];

const PERMIT_COLORS = ['#9C27B0', '#388E3C', '#FFA000', '#D32F2F'];

export default function Reports() {
  const [reportType, setReportType] = useState("system");
  const [timeRange, setTimeRange] = useState("last-30");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  
  // Fetch activity logs
  const { data: activityLogs, isLoading: isLoadingLogs } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
  });
  
  // Fetch alerts
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });
  
  // Fetch work permits
  const { data: workPermits, isLoading: isLoadingPermits } = useQuery<WorkPermit[]>({
    queryKey: ["/api/work-permits"],
  });
  
  const generateReport = () => {
    // In a real application, this would generate and download a report
    console.log("Generating report for:", reportType, "with time range:", timeRange);
  };
  
  const printReport = () => {
    window.print();
  };
  
  const handleRefresh = () => {
    // Refetch data
  };
  
  // Get severity badge color
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "info":
        return "bg-info-light text-info";
      case "warning":
        return "bg-warning-light text-warning";
      case "error":
        return "bg-error-light text-error";
      default:
        return "bg-neutral-200 text-neutral-700";
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
          
          <div className="flex items-center gap-2">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System Performance</SelectItem>
                <SelectItem value="equipment">Equipment Status</SelectItem>
                <SelectItem value="reliability">Reliability Metrics</SelectItem>
                <SelectItem value="activity">Activity Log</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7">Last 7 Days</SelectItem>
                <SelectItem value="last-30">Last 30 Days</SelectItem>
                <SelectItem value="last-90">Last 90 Days</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            {timeRange === 'custom' && (
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            )}
            
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="reliability">Reliability</TabsTrigger>
            <TabsTrigger value="activity-log">Activity Log</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="work-permits">Work Permits</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600">Grid Stability</span>
                        <span className="text-sm font-medium">98.7%</span>
                      </div>
                      <Progress value={98.7} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600">Data Acquisition Rate</span>
                        <span className="text-sm font-medium">99.9%</span>
                      </div>
                      <Progress value={99.9} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600">System Availability</span>
                        <span className="text-sm font-medium">99.95%</span>
                      </div>
                      <Progress value={99.95} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600">Transmission Efficiency</span>
                        <span className="text-sm font-medium">97.7%</span>
                      </div>
                      <Progress value={97.7} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                    Equipment Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={equipmentStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {equipmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                    Work Permit Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workPermitStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {workPermitStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PERMIT_COLORS[index % PERMIT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Reliability Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={reliabilityTrendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#388E3C" />
                    <YAxis yAxisId="right" orientation="right" stroke="#0288D1" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="saidi" stroke="#388E3C" name="SAIDI (min)" />
                    <Line yAxisId="right" type="monotone" dataKey="saifi" stroke="#0288D1" name="SAIFI" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="flex justify-end mt-4 gap-2 print:hidden">
              <Button variant="outline" onClick={generateReport}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
              <Button variant="outline" onClick={printReport}>
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </Button>
            </div>
          </TabsContent>
          
          {/* Equipment Tab */}
          <TabsContent value="equipment">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Equipment Status Report</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Transformers', operational: 6, maintenance: 0, warning: 0, fault: 0 },
                          { name: 'Circuit Breakers', operational: 8, maintenance: 1, warning: 0, fault: 1 },
                          { name: 'Feeders', operational: 10, maintenance: 0, warning: 1, fault: 1 },
                          { name: 'Disconnectors', operational: 12, maintenance: 2, warning: 1, fault: 0 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="operational" stackId="a" fill="#388E3C" name="Operational" />
                        <Bar dataKey="maintenance" stackId="a" fill="#0288D1" name="Maintenance" />
                        <Bar dataKey="warning" stackId="a" fill="#FFA000" name="Warning" />
                        <Bar dataKey="fault" stackId="a" fill="#D32F2F" name="Fault" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <span className="text-3xl font-bold text-success">36</span>
                          <p className="text-sm text-neutral-600">Operational</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <span className="text-3xl font-bold text-info">3</span>
                          <p className="text-sm text-neutral-600">Maintenance</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <span className="text-3xl font-bold text-warning">2</span>
                          <p className="text-sm text-neutral-600">Warning</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <span className="text-3xl font-bold text-error">1</span>
                          <p className="text-sm text-neutral-600">Fault</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reliability Tab */}
          <TabsContent value="reliability">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Reliability Metrics</CardTitle>
                <div className="flex items-center gap-2">
                  <Select defaultValue="month">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="View by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="quarter">Quarter</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <span className="text-4xl font-bold text-primary">98.2</span>
                          <p className="text-sm text-neutral-600">SAIDI (minutes/year)</p>
                          <p className="text-xs text-muted-foreground">System Average Interruption Duration Index</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <span className="text-4xl font-bold text-secondary">1.47</span>
                          <p className="text-sm text-neutral-600">SAIFI (interruptions/year)</p>
                          <p className="text-xs text-muted-foreground">System Average Interruption Frequency Index</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <span className="text-4xl font-bold text-accent">66.8</span>
                          <p className="text-sm text-neutral-600">CAIDI (minutes)</p>
                          <p className="text-xs text-muted-foreground">Customer Average Interruption Duration Index</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={reliabilityTrendData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" stroke="#388E3C" />
                        <YAxis yAxisId="right" orientation="right" stroke="#0288D1" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="saidi" stroke="#388E3C" name="SAIDI (min)" />
                        <Line yAxisId="right" type="monotone" dataKey="saifi" stroke="#0288D1" name="SAIFI" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>SAIDI (min)</TableHead>
                          <TableHead>SAIFI</TableHead>
                          <TableHead>CAIDI (min)</TableHead>
                          <TableHead>Outages</TableHead>
                          <TableHead>Affected Customers</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reliabilityTrendData.map((item, index) => {
                          const caidi = item.saidi / Math.max(0.01, item.saifi);
                          const outages = Math.floor(item.saifi * 10);
                          const customers = Math.floor(outages * 25);
                          
                          return (
                            <TableRow key={index}>
                              <TableCell>{item.month}</TableCell>
                              <TableCell>{item.saidi.toFixed(1)}</TableCell>
                              <TableCell>{item.saifi.toFixed(2)}</TableCell>
                              <TableCell>{caidi.toFixed(1)}</TableCell>
                              <TableCell>{outages}</TableCell>
                              <TableCell>{customers}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Activity Log Tab */}
          <TabsContent value="activity-log">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Activity Log Report</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date Range
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingLogs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : activityLogs && activityLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Entity Type</TableHead>
                          <TableHead>Severity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              {log.action?.replace(/_/g, ' ') || "N/A"}
                            </TableCell>
                            <TableCell>{log.description}</TableCell>
                            <TableCell>{log.userId ? `User #${log.userId}` : "System"}</TableCell>
                            <TableCell>
                              {log.entityType 
                                ? log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1) 
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge className={getSeverityBadge(log.severity)}>
                                {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    No activity logs found for the selected time period
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Alert Report</CardTitle>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Alerts</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="ignored">Ignored</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAlerts ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : alerts && alerts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Resolved By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alerts.map((alert) => (
                          <TableRow key={alert.id}>
                            <TableCell>
                              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                            </TableCell>
                            <TableCell>{alert.title}</TableCell>
                            <TableCell>{alert.description}</TableCell>
                            <TableCell>
                              <Badge className={getSeverityBadge(alert.severity)}>
                                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={alert.status === "active" ? "bg-error-light text-error" : "bg-success-light text-success"}>
                                {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {alert.equipmentId ? `Equipment #${alert.equipmentId}` : "N/A"}
                            </TableCell>
                            <TableCell>
                              {alert.resolvedById ? `User #${alert.resolvedById}` : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    No alerts found for the selected time period
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Work Permits Tab */}
          <TabsContent value="work-permits">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Work Permit Report</CardTitle>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Permits</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={workPermitStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {workPermitStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PERMIT_COLORS[index % PERMIT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center space-y-2">
                              <span className="text-3xl font-bold text-purple-600">15</span>
                              <p className="text-sm text-neutral-600">Completed</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center space-y-2">
                              <span className="text-3xl font-bold text-success">4</span>
                              <p className="text-sm text-neutral-600">In Progress</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center space-y-2">
                              <span className="text-3xl font-bold text-warning">7</span>
                              <p className="text-sm text-neutral-600">Pending</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center space-y-2">
                              <span className="text-3xl font-bold text-error">2</span>
                              <p className="text-sm text-neutral-600">Rejected</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                  
                  {isLoadingPermits ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : workPermits && workPermits.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Permit #</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Requested By</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workPermits.map((permit) => (
                            <TableRow key={permit.id}>
                              <TableCell>{permit.permitNumber}</TableCell>
                              <TableCell>{permit.title}</TableCell>
                              <TableCell>
                                <Badge className={
                                  permit.status === "completed" ? "bg-purple-100 text-purple-800" :
                                  permit.status === "in_progress" ? "bg-green-100 text-green-800" :
                                  permit.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                }>
                                  {permit.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>{permit.location}</TableCell>
                              <TableCell>User #{permit.requestedById}</TableCell>
                              <TableCell>
                                {new Date(permit.startTime).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {new Date(permit.endTime).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      No work permits found for the selected filters
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
