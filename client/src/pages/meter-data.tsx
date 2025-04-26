import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { EnergyReading } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

import {
  Card,
  CardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { 
  Loader2, 
  RefreshCw, 
  Download, 
  AlertCircle, 
  History,
  Filter,
  Battery,
  Zap,
  BarChart3
} from "lucide-react";

export default function MeterData() {
  const [timeRange, setTimeRange] = useState("24h");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch energy readings data
  const { data: energyReadings, isLoading, refetch } = useQuery<EnergyReading[]>({
    queryKey: ["/api/energy-readings", equipmentFilter],
  });
  
  // Processing the data for charts
  const processPowerData = () => {
    if (!energyReadings || energyReadings.length === 0) return [];
    
    // Group by equipment and timestamp (hour)
    const grouped = energyReadings.reduce((acc, reading) => {
      const timestamp = new Date(reading.timestamp);
      const hour = timestamp.getHours();
      const dayHour = `${timestamp.getDate()}/${hour}`;
      
      if (!acc[dayHour]) {
        acc[dayHour] = {
          time: `${hour}:00`,
          totalPower: 0,
          equipmentCount: 0
        };
      }
      
      acc[dayHour].totalPower += reading.value;
      acc[dayHour].equipmentCount += 1;
      
      return acc;
    }, {} as Record<string, { time: string; totalPower: number; equipmentCount: number }>);
    
    // Convert to array and calculate average
    return Object.values(grouped)
      .map(group => ({
        time: group.time,
        power: group.totalPower,
        average: group.totalPower / Math.max(1, group.equipmentCount)
      }))
      .sort((a, b) => {
        const timeA = parseInt(a.time.split(':')[0]);
        const timeB = parseInt(b.time.split(':')[0]);
        return timeA - timeB;
      });
  };
  
  const processVoltageData = () => {
    if (!energyReadings || energyReadings.length === 0) return [];
    
    // Group voltages by hour
    const grouped = energyReadings.reduce((acc, reading) => {
      if (!reading.voltage) return acc;
      
      const timestamp = new Date(reading.timestamp);
      const hour = timestamp.getHours();
      const dayHour = `${timestamp.getDate()}/${hour}`;
      
      if (!acc[dayHour]) {
        acc[dayHour] = {
          time: `${hour}:00`,
          voltages: []
        };
      }
      
      acc[dayHour].voltages.push(reading.voltage);
      
      return acc;
    }, {} as Record<string, { time: string; voltages: number[] }>);
    
    // Calculate min, max, avg voltage for each hour
    return Object.values(grouped)
      .map(group => {
        const min = Math.min(...group.voltages);
        const max = Math.max(...group.voltages);
        const avg = group.voltages.reduce((sum, v) => sum + v, 0) / group.voltages.length;
        
        return {
          time: group.time,
          min,
          max,
          avg
        };
      })
      .sort((a, b) => {
        const timeA = parseInt(a.time.split(':')[0]);
        const timeB = parseInt(b.time.split(':')[0]);
        return timeA - timeB;
      });
  };
  
  const powerData = processPowerData();
  const voltageData = processVoltageData();
  
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold">Meter Data (Zonus Integration)</h1>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6h">Last 6 Hours</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                <SelectItem value="transformers">Transformers</SelectItem>
                <SelectItem value="feeders">Feeders</SelectItem>
                <SelectItem value="substationA">Substation A</SelectItem>
                <SelectItem value="substationB">Substation B</SelectItem>
                <SelectItem value="substationC">Substation C</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="power">Power Measurements</TabsTrigger>
            <TabsTrigger value="voltage">Voltage Measurements</TabsTrigger>
            <TabsTrigger value="quality">Power Quality</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-primary" />
                    Power Flow Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Current Power Flow</span>
                        <span className="text-lg font-medium">86.4 MW</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Peak Today</span>
                        <span className="text-sm font-medium">96.2 MW <span className="text-xs text-muted-foreground">(10:30 AM)</span></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Valley Today</span>
                        <span className="text-sm font-medium">70.5 MW <span className="text-xs text-muted-foreground">(04:15 AM)</span></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">24h Average</span>
                        <span className="text-sm font-medium">83.7 MW</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Battery className="h-5 w-5 mr-2 text-primary" />
                    Voltage Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">High Voltage (110kV)</span>
                        <Badge className="bg-success-light text-success">Nominal</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Medium Voltage (35kV)</span>
                        <Badge className="bg-success-light text-success">Nominal</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Low Voltage (10kV)</span>
                        <Badge className="bg-warning-light text-warning">Fluctuating</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Low Voltage (6kV)</span>
                        <Badge className="bg-success-light text-success">Nominal</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    Zonus Integration Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Connection Status</span>
                      <Badge className="bg-success-light text-success">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Last Data Receipt</span>
                      <span className="text-sm font-medium">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Active Meters</span>
                      <span className="text-sm font-medium">42 / 42</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Data Quality</span>
                      <Badge className="bg-success-light text-success">Good</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Power Flow (Last 24 Hours)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex justify-center h-full items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : powerData.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No data available for the selected filters</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={powerData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="power" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorPower)" 
                        name="Total Power (MW)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Power Measurements Tab */}
          <TabsContent value="power">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Power Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : powerData.length === 0 ? (
                  <div className="flex flex-col justify-center items-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No data available for the selected filters</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={powerData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="power" 
                            stroke="hsl(var(--primary))" 
                            name="Total Power (MW)" 
                            strokeWidth={2} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="average" 
                            stroke="hsl(var(--secondary))" 
                            name="Average per Equipment (MW)" 
                            strokeWidth={2} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Total Power (MW)</TableHead>
                            <TableHead>Average Power (MW)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {powerData.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.time}</TableCell>
                              <TableCell>{item.power.toFixed(2)}</TableCell>
                              <TableCell>{item.average.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Voltage Measurements Tab */}
          <TabsContent value="voltage">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Voltage Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : voltageData.length === 0 ? (
                  <div className="flex flex-col justify-center items-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No voltage data available for the selected filters</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={voltageData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="min" 
                            stroke="hsl(var(--error))" 
                            name="Min Voltage (kV)" 
                            strokeWidth={2} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="avg" 
                            stroke="hsl(var(--primary))" 
                            name="Avg Voltage (kV)" 
                            strokeWidth={2} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="max" 
                            stroke="hsl(var(--success))" 
                            name="Max Voltage (kV)" 
                            strokeWidth={2} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Min Voltage (kV)</TableHead>
                            <TableHead>Avg Voltage (kV)</TableHead>
                            <TableHead>Max Voltage (kV)</TableHead>
                            <TableHead>Variation (%)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {voltageData.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.time}</TableCell>
                              <TableCell>{item.min.toFixed(2)}</TableCell>
                              <TableCell>{item.avg.toFixed(2)}</TableCell>
                              <TableCell>{item.max.toFixed(2)}</TableCell>
                              <TableCell>
                                {item.avg > 0 
                                  ? (((item.max - item.min) / item.avg) * 100).toFixed(2) 
                                  : "N/A"}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Power Quality Tab */}
          <TabsContent value="quality">
            <Card>
              <CardContent className="p-6 h-96 flex items-center justify-center">
                <div className="text-center">
                  <History className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                  <h3 className="text-lg font-medium mb-2">Power Quality Analysis</h3>
                  <p className="text-muted-foreground max-w-md">
                    Power quality analysis module will be available in the next update. This feature will provide
                    harmonics analysis, flicker measurements, and detailed power quality reports.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Historical Data Tab */}
          <TabsContent value="historical">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Historical Data Archive</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : energyReadings && energyReadings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Equipment ID</TableHead>
                          <TableHead>Value (MW)</TableHead>
                          <TableHead>Voltage (kV)</TableHead>
                          <TableHead>Current (A)</TableHead>
                          <TableHead>Frequency (Hz)</TableHead>
                          <TableHead>Power Factor</TableHead>
                          <TableHead>Source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {energyReadings.slice(0, 15).map((reading) => (
                          <TableRow key={reading.id}>
                            <TableCell>
                              {formatDistanceToNow(new Date(reading.timestamp), { addSuffix: true })}
                            </TableCell>
                            <TableCell>{reading.equipmentId}</TableCell>
                            <TableCell>{reading.value.toFixed(2)}</TableCell>
                            <TableCell>{reading.voltage ? reading.voltage.toFixed(2) : "N/A"}</TableCell>
                            <TableCell>{reading.current ? reading.current.toFixed(2) : "N/A"}</TableCell>
                            <TableCell>{reading.frequency ? reading.frequency.toFixed(2) : "N/A"}</TableCell>
                            <TableCell>{reading.powerFactor ? reading.powerFactor.toFixed(2) : "N/A"}</TableCell>
                            <TableCell>{reading.source || "zonus"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {energyReadings.length > 15 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline">
                          Load More Records
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No historical data available for the selected filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
