import { useState } from "react";
import { AppLayout } from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Demo data for charts
const energyConsumptionData = [
  { time: "00:00", consumption: 45.2, losses: 1.8 },
  { time: "02:00", consumption: 42.1, losses: 1.7 },
  { time: "04:00", consumption: 40.5, losses: 1.6 },
  { time: "06:00", consumption: 43.8, losses: 1.9 },
  { time: "08:00", consumption: 55.2, losses: 2.2 },
  { time: "10:00", consumption: 68.4, losses: 2.8 },
  { time: "12:00", consumption: 75.1, losses: 3.0 },
  { time: "14:00", consumption: 78.2, losses: 3.1 },
  { time: "16:00", consumption: 76.5, losses: 3.1 },
  { time: "18:00", consumption: 82.3, losses: 3.3 },
  { time: "20:00", consumption: 74.6, losses: 3.0 },
  { time: "22:00", consumption: 56.8, losses: 2.3 },
];

const voltageData = [
  { time: "00:00", voltage: 110.2 },
  { time: "02:00", voltage: 110.5 },
  { time: "04:00", voltage: 109.8 },
  { time: "06:00", voltage: 110.1 },
  { time: "08:00", voltage: 111.3 },
  { time: "10:00", voltage: 112.5 },
  { time: "12:00", voltage: 113.8 },
  { time: "14:00", voltage: 114.2 },
  { time: "16:00", voltage: 113.5 },
  { time: "18:00", voltage: 113.1 },
  { time: "20:00", voltage: 112.6 },
  { time: "22:00", voltage: 111.4 },
];

const equipmentStatusData = [
  { name: "Operational", value: 85, color: "#388E3C" },
  { name: "Maintenance", value: 10, color: "#F57C00" },
  { name: "Fault", value: 5, color: "#D32F2F" },
];

const alertsByTypeData = [
  { name: "Critical", value: 12, color: "#D32F2F" },
  { name: "Warning", value: 35, color: "#F57C00" },
  { name: "Information", value: 53, color: "#2196F3" },
];

const reliabilityMetricsData = [
  { name: "Jan", SAIDI: 4.2, SAIFI: 1.1, CAIDI: 3.8 },
  { name: "Feb", SAIDI: 3.8, SAIFI: 0.9, CAIDI: 4.2 },
  { name: "Mar", SAIDI: 2.5, SAIFI: 0.8, CAIDI: 3.1 },
  { name: "Apr", SAIDI: 3.2, SAIFI: 1.0, CAIDI: 3.2 },
  { name: "May", SAIDI: 2.9, SAIFI: 0.7, CAIDI: 4.1 },
  { name: "Jun", SAIDI: 3.5, SAIFI: 0.9, CAIDI: 3.9 },
];

import { Helmet } from "react-helmet";
import { PerformanceMetrics } from "@/components/analytics/performance-metrics";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("24h");

  return (
    <AppLayout>
      <Helmet>
        <title>Analytics | Energy Management System</title>
      </Helmet>
      
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze energy data, performance metrics, and system efficiency
          </p>
        </div>
        
        <PerformanceMetrics />
        
        <div className="flex justify-between items-center mt-8">
          <h2 className="text-xl font-semibold">Historical Analytics</h2>
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last Quarter</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="energy">
          <TabsList className="mb-6">
            <TabsTrigger value="energy">Energy Analysis</TabsTrigger>
            <TabsTrigger value="reliability">Reliability Metrics</TabsTrigger>
            <TabsTrigger value="equipment">Equipment Status</TabsTrigger>
            <TabsTrigger value="alerts">Alert Analytics</TabsTrigger>
          </TabsList>
          
          {/* Energy Analysis Tab */}
          <TabsContent value="energy" className="space-y-6">
            {/* Power Consumption Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Power Consumption and Losses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyConsumptionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} MW`, '']}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="consumption" 
                        name="Consumption" 
                        stroke="#1976D2" 
                        fill="#1976D2" 
                        fillOpacity={0.8}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="losses" 
                        name="Losses" 
                        stroke="#FF8F00" 
                        fill="#FF8F00" 
                        fillOpacity={0.8}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Voltage Analysis */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Voltage Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={voltageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        formatter={(value) => [`${value} kV`, '']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="voltage" 
                        name="Voltage" 
                        stroke="#4CAF50" 
                        fill="#4CAF50" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reliability Metrics Tab */}
          <TabsContent value="reliability" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Reliability Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reliabilityMetricsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="SAIDI" 
                        name="SAIDI (minutes)" 
                        fill="#1976D2" 
                      />
                      <Bar 
                        dataKey="SAIFI" 
                        name="SAIFI (interruptions)" 
                        fill="#009688" 
                      />
                      <Bar 
                        dataKey="CAIDI" 
                        name="CAIDI (minutes/interruption)" 
                        fill="#FF8F00" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <h3 className="text-sm font-medium text-neutral-600">SAIDI</h3>
                    <p className="text-xl font-bold text-primary-700">3.35</p>
                    <p className="text-xs text-neutral-500">System Average Interruption Duration Index</p>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-lg">
                    <h3 className="text-sm font-medium text-neutral-600">SAIFI</h3>
                    <p className="text-xl font-bold text-teal-700">0.90</p>
                    <p className="text-xs text-neutral-500">System Average Interruption Frequency Index</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="text-sm font-medium text-neutral-600">CAIDI</h3>
                    <p className="text-xl font-bold text-amber-700">3.72</p>
                    <p className="text-xs text-neutral-500">Customer Average Interruption Duration Index</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equipment Status Tab */}
          <TabsContent value="equipment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Equipment Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-80 w-full max-w-md">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={equipmentStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {equipmentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} equipment`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Equipment Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { age: "0-2 years", count: 12 },
                          { age: "3-5 years", count: 18 },
                          { age: "6-10 years", count: 29 },
                          { age: "11-15 years", count: 14 },
                          { age: "16+ years", count: 7 },
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey="count" 
                          name="Equipment Count" 
                          fill="#1976D2" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alert Analytics Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Alerts by Type</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-80 w-full max-w-md">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={alertsByTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {alertsByTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} alerts`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Alert Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { day: "Mon", critical: 3, warning: 5, info: 8 },
                          { day: "Tue", critical: 2, warning: 6, info: 10 },
                          { day: "Wed", critical: 1, warning: 8, info: 7 },
                          { day: "Thu", critical: 4, warning: 5, info: 12 },
                          { day: "Fri", critical: 2, warning: 7, info: 9 },
                          { day: "Sat", critical: 0, warning: 4, info: 5 },
                          { day: "Sun", critical: 0, warning: 0, info: 2 },
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="critical" 
                          name="Critical Alerts" 
                          stackId="1"
                          stroke="#D32F2F" 
                          fill="#D32F2F" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="warning" 
                          name="Warning Alerts" 
                          stackId="1"
                          stroke="#F57C00" 
                          fill="#F57C00" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="info" 
                          name="Info Alerts" 
                          stackId="1"
                          stroke="#2196F3" 
                          fill="#2196F3" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
