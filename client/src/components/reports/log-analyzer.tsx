import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert as AlertUI, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertCircle, Clock, Filter, Download } from "lucide-react";
import { Alert } from "@shared/schema";

// Log severity enum
enum LogSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

// Log entry interface
interface LogEntry {
  id: number;
  timestamp: string;
  component: string;
  severity: LogSeverity;
  message: string;
  source: string;
  details?: string;
}

// Parsed statistics interface
interface LogStatistics {
  totalLogs: number;
  byComponent: Record<string, number>;
  bySeverity: Record<string, number>;
  byTimeOfDay: Record<string, number>;
  recentErrors: LogEntry[];
}

export function LogAnalyzer() {
  const [timeRange, setTimeRange] = useState("24h");
  const [filterComponent, setFilterComponent] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch logs
  const { data: logs, isLoading, error } = useQuery<LogEntry[]>({
    queryKey: ["/api/logs", timeRange, filterComponent, filterSeverity],
    queryFn: async () => {
      try {
        // We'll simulate data for now
        return getMockLogs();
      } catch (err) {
        console.error("Error fetching logs:", err);
        throw err;
      }
    }
  });

  // Filter logs based on search and filters
  const filteredLogs = React.useMemo(() => {
    if (!logs) return [];
    
    return logs.filter(log => {
      // Apply component filter
      if (filterComponent !== "all" && log.component !== filterComponent) return false;
      
      // Apply severity filter
      if (filterSeverity !== "all" && log.severity !== filterSeverity) return false;
      
      // Apply search query
      if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      return true;
    });
  }, [logs, filterComponent, filterSeverity, searchQuery]);

  // Calculate statistics from logs
  const statistics = React.useMemo(() => {
    if (!filteredLogs?.length) return null;
    
    const stats: LogStatistics = {
      totalLogs: filteredLogs.length,
      byComponent: {},
      bySeverity: {},
      byTimeOfDay: {
        "00-06": 0,
        "06-12": 0,
        "12-18": 0,
        "18-24": 0,
      },
      recentErrors: []
    };
    
    filteredLogs.forEach(log => {
      // Count by component
      stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      
      // Count by time of day
      const hour = new Date(log.timestamp).getHours();
      if (hour >= 0 && hour < 6) stats.byTimeOfDay["00-06"]++;
      else if (hour >= 6 && hour < 12) stats.byTimeOfDay["06-12"]++;
      else if (hour >= 12 && hour < 18) stats.byTimeOfDay["12-18"]++;
      else stats.byTimeOfDay["18-24"]++;
      
      // Recent errors
      if (log.severity === LogSeverity.ERROR || log.severity === LogSeverity.CRITICAL) {
        stats.recentErrors.push(log);
      }
    });
    
    // Sort recent errors by timestamp (newest first)
    stats.recentErrors.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 5);
    
    return stats;
  }, [filteredLogs]);

  // Generate chart data
  const severityChartData = React.useMemo(() => {
    if (!statistics) return [];
    
    return Object.entries(statistics.bySeverity).map(([severity, count]) => ({
      severity,
      count
    }));
  }, [statistics]);

  const componentChartData = React.useMemo(() => {
    if (!statistics) return [];
    
    return Object.entries(statistics.byComponent).map(([component, count]) => ({
      component,
      count
    }));
  }, [statistics]);

  const timeChartData = React.useMemo(() => {
    if (!statistics) return [];
    
    return Object.entries(statistics.byTimeOfDay).map(([timeRange, count]) => ({
      timeRange,
      count
    }));
  }, [statistics]);

  // Get severity badge styling
  const getSeverityBadge = (severity: LogSeverity) => {
    switch (severity) {
      case LogSeverity.INFO:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Info</Badge>;
      case LogSeverity.WARNING:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Warning</Badge>;
      case LogSeverity.ERROR:
        return <Badge variant="outline" className="bg-red-50 text-red-700">Error</Badge>;
      case LogSeverity.CRITICAL:
        return <Badge variant="outline" className="bg-red-100 text-red-900 font-bold">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const exportLogsToCSV = () => {
    if (!filteredLogs?.length) return;
    
    const headers = ["ID", "Timestamp", "Component", "Severity", "Message", "Source", "Details"];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.id,
        log.timestamp,
        log.component,
        log.severity,
        `"${log.message.replace(/"/g, '""')}"`,
        log.source,
        log.details ? `"${log.details.replace(/"/g, '""')}"` : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock data for demonstration
  function getMockLogs(): LogEntry[] {
    const components = ["network", "equipment", "auth", "database", "api", "scheduler"];
    const sources = ["server", "client", "database", "external-api"];
    const severities = [LogSeverity.INFO, LogSeverity.WARNING, LogSeverity.ERROR, LogSeverity.CRITICAL];
    const messages = [
      "System started successfully",
      "Connection established",
      "User login attempt",
      "Authentication failed",
      "Database connection timeout",
      "API rate limit exceeded",
      "Equipment status changed",
      "Measurement value out of range",
      "Node communication lost",
      "Backup completed",
      "Configuration updated",
      "Scheduled maintenance started",
      "Memory usage high",
      "CPU usage spike detected",
      "Network packet loss detected"
    ];
    
    const logs: LogEntry[] = [];
    
    // Create mock logs for the past 7 days
    const now = new Date();
    const daysBack = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30;
    
    for (let i = 0; i < 200; i++) {
      const randomDate = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      logs.push({
        id: i + 1,
        timestamp: randomDate.toISOString(),
        component: components[Math.floor(Math.random() * components.length)],
        severity,
        message: messages[Math.floor(Math.random() * messages.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        details: severity === LogSeverity.ERROR || severity === LogSeverity.CRITICAL 
          ? "Error stack trace or additional diagnostic information would appear here."
          : undefined
      });
    }
    
    // Sort by timestamp (newest first)
    return logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>System Logs Analysis</CardTitle>
          <CardDescription>Loading logs...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>System Logs Analysis</CardTitle>
          <CardDescription>Error loading logs</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertUI variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load system logs. Please try again later.
            </AlertDescription>
          </AlertUI>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>System Logs Analysis</CardTitle>
            <CardDescription>
              Analyze system logs and monitor application health
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={exportLogsToCSV}
              disabled={!filteredLogs?.length}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">Log Entries</TabsTrigger>
            <TabsTrigger value="charts">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {statistics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Total Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{statistics.totalLogs}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">
                        {statistics.bySeverity[LogSeverity.ERROR] || 0}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Critical Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-800">
                        {statistics.bySeverity[LogSeverity.CRITICAL] || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Recent Errors</h3>
                  {statistics.recentErrors.length > 0 ? (
                    <div className="space-y-2">
                      {statistics.recentErrors.slice(0, 5).map(log => (
                        <div key={log.id} className="p-3 border rounded-md bg-red-50">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                              {getSeverityBadge(log.severity)}
                              <span className="font-medium">{log.component}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                          <div className="mt-1 text-red-700">{log.message}</div>
                          {log.details && (
                            <div className="mt-1 text-sm text-gray-700 bg-white p-2 rounded">
                              {log.details}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-green-200 rounded-md bg-green-50 text-green-700">
                      No errors found in the selected time period.
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Logs by Component</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={componentChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="component" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Log Count" fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border rounded-md bg-gray-50 text-gray-700">
                No logs available for the selected time period.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="logs">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                
                <div className="flex gap-2">
                  <Select value={filterComponent} onValueChange={setFilterComponent}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Component" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Components</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="scheduler">Scheduler</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-[150px]">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Severity</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Component</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.slice(0, 100).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>{log.component}</TableCell>
                        <TableCell>
                          <div>{log.message}</div>
                          {log.details && (
                            <div className="mt-1 text-xs text-gray-500 max-w-md truncate">
                              {log.details}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{log.source}</TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No logs found matching the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {filteredLogs.length > 100 && (
                  <div className="p-2 text-center text-sm text-gray-500 border-t">
                    Showing 100 of {filteredLogs.length} log entries. Use filters to narrow down results.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="charts">
            {statistics ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-3">Logs by Severity</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={severityChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="severity" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Logs by Time of Day</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeRange" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Count" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Logs by Component</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={componentChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="component" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Count" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border rounded-md bg-gray-50 text-gray-700">
                No logs available for the selected time period.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}