import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from "recharts";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter, RefreshCw } from "lucide-react";

// Sample data (will be replaced with actual API data)
const energyData = [
  { time: '00:00', incoming: 82, outgoing: 79, loss: 3 },
  { time: '02:00', incoming: 75, outgoing: 72, loss: 3 },
  { time: '04:00', incoming: 70, outgoing: 67, loss: 3 },
  { time: '06:00', incoming: 78, outgoing: 75, loss: 3 },
  { time: '08:00', incoming: 87, outgoing: 84, loss: 3 },
  { time: '10:00', incoming: 92, outgoing: 89, loss: 3 },
  { time: '12:00', incoming: 96, outgoing: 93, loss: 3 },
  { time: '14:00', incoming: 94, outgoing: 91, loss: 3 },
  { time: '16:00', incoming: 89, outgoing: 86, loss: 3 },
  { time: '18:00', incoming: 96, outgoing: 92, loss: 4 },
  { time: '20:00', incoming: 93, outgoing: 90, loss: 3 },
  { time: '22:00', incoming: 85, outgoing: 82, loss: 3 },
];

const voltageData = [
  { time: '00:00', voltage110kV: 109.8, voltage35kV: 34.9, voltage10kV: 10.1 },
  { time: '02:00', voltage110kV: 110.2, voltage35kV: 35.1, voltage10kV: 10.0 },
  { time: '04:00', voltage110kV: 110.1, voltage35kV: 35.0, voltage10kV: 10.0 },
  { time: '06:00', voltage110kV: 109.9, voltage35kV: 35.2, voltage10kV: 10.1 },
  { time: '08:00', voltage110kV: 109.7, voltage35kV: 34.8, voltage10kV: 9.9 },
  { time: '10:00', voltage110kV: 110.3, voltage35kV: 35.1, voltage10kV: 10.0 },
  { time: '12:00', voltage110kV: 110.0, voltage35kV: 35.0, voltage10kV: 10.1 },
  { time: '14:00', voltage110kV: 109.8, voltage35kV: 34.9, voltage10kV: 10.0 },
  { time: '16:00', voltage110kV: 110.1, voltage35kV: 35.0, voltage10kV: 10.0 },
  { time: '18:00', voltage110kV: 110.2, voltage35kV: 35.1, voltage10kV: 10.1 },
  { time: '20:00', voltage110kV: 109.9, voltage35kV: 34.9, voltage10kV: 9.9 },
  { time: '22:00', voltage110kV: 110.0, voltage35kV: 35.0, voltage10kV: 10.0 },
];

const loadDistribution = [
  { name: 'Industrial', value: 42 },
  { name: 'Commercial', value: 28 },
  { name: 'Residential', value: 18 },
  { name: 'Public Services', value: 8 },
  { name: 'Others', value: 4 },
];

export default function EnergyAnalytics() {
  const [timeRange, setTimeRange] = useState('24h');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    to: new Date()
  });
  
  const { data: energyReadings, isLoading } = useQuery({
    queryKey: ["/api/energy-readings", equipmentFilter],
  });
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Energy Analytics</h1>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Time Range:</span>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {timeRange === 'custom' && (
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Equipment:</span>
              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Equipment" />
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
            </div>
            
            <Button variant="outline" size="sm" className="ml-auto">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </CardContent>
        </Card>
        
        {/* Analytics Tabs */}
        <Tabs defaultValue="energy-flow" className="space-y-4">
          <TabsList>
            <TabsTrigger value="energy-flow">Energy Flow</TabsTrigger>
            <TabsTrigger value="voltage-analysis">Voltage Analysis</TabsTrigger>
            <TabsTrigger value="load-distribution">Load Distribution</TabsTrigger>
            <TabsTrigger value="trends">Trends & Forecasts</TabsTrigger>
          </TabsList>
          
          {/* Energy Flow Tab */}
          <TabsContent value="energy-flow" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Energy Flow (MW)</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={energyData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--error))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--error))" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="incoming" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIncoming)" name="Incoming Power" />
                      <Area type="monotone" dataKey="outgoing" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorOutgoing)" name="Outgoing Power" />
                      <Area type="monotone" dataKey="loss" stroke="hsl(var(--error))" fillOpacity={1} fill="url(#colorLoss)" name="System Losses" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Average Power Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-500">Incoming Power (110kV)</p>
                      <p className="text-2xl font-medium">85.6 MW</p>
                      <div className="h-2 w-full bg-neutral-100 rounded mt-1">
                        <div className="h-2 bg-primary rounded w-[85.6%]"></div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-neutral-500">Distribution (35kV)</p>
                      <p className="text-2xl font-medium">42.3 MW</p>
                      <div className="h-2 w-full bg-neutral-100 rounded mt-1">
                        <div className="h-2 bg-secondary rounded w-[42.3%]"></div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-neutral-500">Distribution (10kV)</p>
                      <p className="text-2xl font-medium">28.9 MW</p>
                      <div className="h-2 w-full bg-neutral-100 rounded mt-1">
                        <div className="h-2 bg-secondary-light rounded w-[28.9%]"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>System Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center rounded-full w-24 h-24 bg-primary/10 text-primary">
                        <span className="text-2xl font-bold">97.7%</span>
                      </div>
                      <p className="mt-2 text-sm text-neutral-500">Overall Efficiency</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-neutral-500">Total Losses</p>
                      <p className="text-xl font-medium">2.0 MW <span className="text-sm text-error">(2.3%)</span></p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-neutral-500">Year-Over-Year Improvement</p>
                      <p className="text-xl font-medium">+0.4% <span className="text-sm text-success">↑</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Peak Load</p>
                      <p className="font-medium">96.0 MW</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Valley Load</p>
                      <p className="font-medium">70.0 MW</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Load Factor</p>
                      <p className="font-medium">0.89</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Capacity Utilization</p>
                      <p className="font-medium">76.4%</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">SAIDI</p>
                      <p className="font-medium">98.2 min</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">SAIFI</p>
                      <p className="font-medium">1.47</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Voltage Analysis Tab */}
          <TabsContent value="voltage-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voltage Levels (kV)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
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
                    <Line type="monotone" dataKey="voltage110kV" stroke="hsl(var(--primary))" name="110kV" />
                    <Line type="monotone" dataKey="voltage35kV" stroke="hsl(var(--secondary))" name="35kV" />
                    <Line type="monotone" dataKey="voltage10kV" stroke="hsl(var(--accent))" name="10kV" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>High Voltage (110kV)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Average</p>
                      <p className="font-medium">110.0 kV</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Minimum</p>
                      <p className="font-medium">109.7 kV</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Maximum</p>
                      <p className="font-medium">110.3 kV</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Variation</p>
                      <p className="font-medium">±0.3%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Medium Voltage (35kV)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Average</p>
                      <p className="font-medium">35.0 kV</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Minimum</p>
                      <p className="font-medium">34.8 kV</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Maximum</p>
                      <p className="font-medium">35.2 kV</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Variation</p>
                      <p className="font-medium">±0.6%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Low Voltage (10kV)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Average</p>
                      <p className="font-medium">10.0 kV</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Minimum</p>
                      <p className="font-medium">9.9 kV</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Maximum</p>
                      <p className="font-medium">10.1 kV</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-500">Variation</p>
                      <p className="font-medium">±1.0%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Load Distribution Tab */}
          <TabsContent value="load-distribution" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Customer Load Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={loadDistribution}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Load Characteristics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Industrial</p>
                        <p className="text-sm font-medium">42%</p>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Commercial</p>
                        <p className="text-sm font-medium">28%</p>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div className="bg-secondary h-2.5 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Residential</p>
                        <p className="text-sm font-medium">18%</p>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div className="bg-accent h-2.5 rounded-full" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Public Services</p>
                        <p className="text-sm font-medium">8%</p>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div className="bg-info h-2.5 rounded-full" style={{ width: '8%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Others</p>
                        <p className="text-sm font-medium">4%</p>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div className="bg-neutral-500 h-2.5 rounded-full" style={{ width: '4%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Load Forecast (Next 24 Hours)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex items-center justify-center h-full">
                  <p className="text-neutral-500">Load forecast feature will be available in the next update.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
