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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert as AlertUI, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, CalendarIcon, Download, FileText, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Equipment, Alert } from "@shared/schema";

// Energy report types
interface EnergyData {
  timestamp: string;
  value: number;
  type: string;
  unit: string;
}

interface EquipmentEnergyData {
  equipmentId: string;
  name: string;
  data: EnergyData[];
}

interface EnergyReport {
  id: string;
  name: string;
  description: string;
  generatedAt: string;
  timeRange: {
    from: string;
    to: string;
  };
  totalConsumption: number;
  totalGeneration: number;
  peakDemand: number;
  equipmentData: EquipmentEnergyData[];
}

export function EnergyReports() {
  const [reportType, setReportType] = useState("consumption");
  const [timeRange, setTimeRange] = useState("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  
  // Fetch reports
  const { data: reports, isLoading: isLoadingReports, error: reportsError } = useQuery<EnergyReport[]>({
    queryKey: ["/api/reports/energy", reportType, timeRange],
    queryFn: async () => {
      try {
        // We'll simulate data for now
        return getMockReports();
      } catch (err) {
        console.error("Error fetching reports:", err);
        throw err;
      }
    }
  });

  // Fetch equipment for filtering
  const { data: equipment, isLoading: isLoadingEquipment } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/equipment");
        if (!res.ok) throw new Error("Failed to fetch equipment");
        return await res.json();
      } catch (err) {
        console.error("Error fetching equipment:", err);
        throw err;
      }
    }
  });

  // Format the date range for display
  const getFormattedDateRange = () => {
    let fromDate = new Date(selectedDate);
    let toDate = new Date(selectedDate);
    
    if (timeRange === "day") {
      return format(selectedDate, "MMMM d, yyyy");
    } else if (timeRange === "week") {
      fromDate = new Date(selectedDate.getTime() - 6 * 24 * 60 * 60 * 1000);
      return `${format(fromDate, "MMM d")} - ${format(toDate, "MMM d, yyyy")}`;
    } else if (timeRange === "month") {
      return format(selectedDate, "MMMM yyyy");
    } else { // year
      return format(selectedDate, "yyyy");
    }
  };

  // Filter data by selected equipment
  const filteredData = React.useMemo(() => {
    if (!reports?.length) return [];
    
    const report = reports[0]; // Just use the first report for now
    
    if (selectedEquipment === "all") {
      return report.equipmentData;
    } else {
      return report.equipmentData.filter(
        eqData => eqData.equipmentId === selectedEquipment
      );
    }
  }, [reports, selectedEquipment]);

  // Prepare chart data for consumption
  const consumptionChartData = React.useMemo(() => {
    if (!filteredData?.length) return [];
    
    // Aggregate data by day for the chart
    const aggregatedData: Record<string, { date: string; value: number }> = {};
    
    filteredData.forEach(equipment => {
      equipment.data.forEach(dataPoint => {
        if (dataPoint.type === "consumption") {
          const date = dataPoint.timestamp.split("T")[0];
          if (!aggregatedData[date]) {
            aggregatedData[date] = { date, value: 0 };
          }
          aggregatedData[date].value += dataPoint.value;
        }
      });
    });
    
    return Object.values(aggregatedData).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Prepare data for power distribution pie chart
  const powerDistributionData = React.useMemo(() => {
    if (!filteredData?.length) return [];
    
    const equipmentTotals = filteredData.map(equipment => {
      // Sum up consumption values for each equipment
      const total = equipment.data
        .filter(d => d.type === "consumption")
        .reduce((sum, point) => sum + point.value, 0);
      
      return {
        name: equipment.name,
        value: total
      };
    });
    
    return equipmentTotals.filter(item => item.value > 0);
  }, [filteredData]);

  // Prepare energy balance data
  const energyBalanceData = React.useMemo(() => {
    if (!reports?.length) return { consumption: 0, generation: 0, balance: 0 };
    
    const report = reports[0];
    return {
      consumption: report.totalConsumption,
      generation: report.totalGeneration,
      balance: report.totalGeneration - report.totalConsumption
    };
  }, [reports]);

  // Export report to CSV
  const exportReportToCSV = () => {
    if (!filteredData?.length) return;
    
    const headers = ["Equipment ID", "Equipment Name", "Timestamp", "Type", "Value", "Unit"];
    const rows: string[][] = [];
    
    filteredData.forEach(equipment => {
      equipment.data.forEach(dataPoint => {
        rows.push([
          equipment.equipmentId,
          equipment.name,
          dataPoint.timestamp,
          dataPoint.type,
          dataPoint.value.toString(),
          dataPoint.unit
        ]);
      });
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `energy-report-${timeRange}-${format(selectedDate, "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock data for demonstration
  function getMockReports(): EnergyReport[] {
    const now = new Date();
    const report: EnergyReport = {
      id: "report-1",
      name: "Energy Consumption Report",
      description: "Detailed energy consumption and generation data",
      generatedAt: now.toISOString(),
      timeRange: {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        to: now.toISOString()
      },
      totalConsumption: 12450.75,
      totalGeneration: 4250.30,
      peakDemand: 875.25,
      equipmentData: []
    };
    
    // Mock equipment data
    const equipmentList = [
      { id: "EQ-1023", name: "Transformer TR-101" },
      { id: "EQ-1024", name: "Main Switchgear" },
      { id: "EQ-1025", name: "Solar Array" },
      { id: "EQ-1026", name: "Battery Storage" },
      { id: "EQ-1027", name: "Distribution Panel DP-01" }
    ];
    
    // Generate data for each equipment
    equipmentList.forEach(eq => {
      const dataPoints: EnergyData[] = [];
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      
      // Generate data for each day in the current month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        
        // Skip future dates
        if (date > now) continue;
        
        // Add consumption data
        dataPoints.push({
          timestamp: new Date(date.getFullYear(), date.getMonth(), day, 12, 0, 0).toISOString(),
          value: eq.id === "EQ-1025" ? 0 : Math.random() * 100 + 50,
          type: "consumption",
          unit: "kWh"
        });
        
        // Add generation data only for the solar array
        if (eq.id === "EQ-1025") {
          dataPoints.push({
            timestamp: new Date(date.getFullYear(), date.getMonth(), day, 12, 0, 0).toISOString(),
            value: Math.random() * 200 + 100,
            type: "generation",
            unit: "kWh"
          });
        }
      }
      
      report.equipmentData.push({
        equipmentId: eq.id,
        name: eq.name,
        data: dataPoints
      });
    });
    
    return [report];
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoadingReports || isLoadingEquipment) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Energy Reports</CardTitle>
          <CardDescription>Loading reports...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (reportsError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Energy Reports</CardTitle>
          <CardDescription>Error loading reports</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertUI variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load energy reports. Please try again later.
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
            <CardTitle>Energy Reports</CardTitle>
            <CardDescription>
              Analyze energy consumption and generation patterns
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {getFormattedDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportReportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="consumption">Consumption</TabsTrigger>
            <TabsTrigger value="generation">Generation</TabsTrigger>
            <TabsTrigger value="balance">Energy Balance</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <Select
              value={selectedEquipment}
              onValueChange={setSelectedEquipment}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                {equipment?.map((eq) => (
                  <SelectItem key={eq.id} value={eq.equipmentId}>
                    {eq.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={reportType}
              onValueChange={setReportType}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consumption">Consumption</SelectItem>
                <SelectItem value="generation">Generation</SelectItem>
                <SelectItem value="efficiency">Efficiency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Total Consumption</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {energyBalanceData.consumption.toLocaleString()} kWh
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Total Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {energyBalanceData.generation.toLocaleString()} kWh
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Energy Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${energyBalanceData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {energyBalanceData.balance >= 0 ? '+' : ''}
                    {energyBalanceData.balance.toLocaleString()} kWh
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Energy Consumption Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={consumptionChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name="Consumption (kWh)" 
                          stroke="#0088FE" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Energy Distribution by Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={powerDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {powerDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()} kWh`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="consumption">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Energy Consumption Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={consumptionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name="Consumption (kWh)" 
                        fill="#8884d8" 
                        stroke="#8884d8"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Consumption by Equipment</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Total Consumption</TableHead>
                        <TableHead>Average Daily</TableHead>
                        <TableHead>Peak</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((equipment) => {
                        const consumptionData = equipment.data.filter(d => d.type === "consumption");
                        const total = consumptionData.reduce((sum, point) => sum + point.value, 0);
                        const peak = Math.max(...consumptionData.map(d => d.value), 0);
                        const avg = consumptionData.length ? total / consumptionData.length : 0;
                        
                        return (
                          <TableRow key={equipment.equipmentId}>
                            <TableCell className="font-medium">{equipment.name}</TableCell>
                            <TableCell>{total.toLocaleString()} kWh</TableCell>
                            <TableCell>{avg.toFixed(2)} kWh</TableCell>
                            <TableCell>{peak.toLocaleString()} kWh</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="generation">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Energy Generation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredData.some(e => e.data.some(d => d.type === "generation")) ? (
                  <>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredData
                            .flatMap(equipment => 
                              equipment.data
                                .filter(d => d.type === "generation")
                                .map(d => ({
                                  date: d.timestamp.split('T')[0],
                                  equipment: equipment.name,
                                  value: d.value
                                }))
                            )
                            .sort((a, b) => a.date.localeCompare(b.date))
                          }
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Generation (kWh)" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Generation Sources</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Source</TableHead>
                            <TableHead>Total Generation</TableHead>
                            <TableHead>Average Daily</TableHead>
                            <TableHead>Peak</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredData
                            .filter(equipment => equipment.data.some(d => d.type === "generation"))
                            .map((equipment) => {
                              const generationData = equipment.data.filter(d => d.type === "generation");
                              const total = generationData.reduce((sum, point) => sum + point.value, 0);
                              const peak = Math.max(...generationData.map(d => d.value), 0);
                              const avg = generationData.length ? total / generationData.length : 0;
                              
                              return (
                                <TableRow key={equipment.equipmentId}>
                                  <TableCell className="font-medium">{equipment.name}</TableCell>
                                  <TableCell>{total.toLocaleString()} kWh</TableCell>
                                  <TableCell>{avg.toFixed(2)} kWh</TableCell>
                                  <TableCell>{peak.toLocaleString()} kWh</TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="p-4 border rounded-md bg-amber-50 text-amber-700">
                    No generation data available for the selected equipment or time period.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="balance">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Energy Balance Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Energy Balance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between p-4 bg-gray-50 rounded-md">
                        <span className="font-medium">Total Consumption:</span>
                        <span>{energyBalanceData.consumption.toLocaleString()} kWh</span>
                      </div>
                      <div className="flex justify-between p-4 bg-green-50 rounded-md">
                        <span className="font-medium">Total Generation:</span>
                        <span>{energyBalanceData.generation.toLocaleString()} kWh</span>
                      </div>
                      <div className={`flex justify-between p-4 rounded-md ${energyBalanceData.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        <span className="font-medium">Net Balance:</span>
                        <span className="font-semibold">
                          {energyBalanceData.balance >= 0 ? '+' : ''}
                          {energyBalanceData.balance.toLocaleString()} kWh
                        </span>
                      </div>
                      
                      <div className="mt-6 p-4 border rounded-md">
                        <h4 className="text-md font-medium mb-2">Analysis</h4>
                        {energyBalanceData.balance >= 0 ? (
                          <p className="text-green-700">
                            Your energy generation exceeds consumption, resulting in a positive energy balance.
                            This excess energy may be available for storage or grid export.
                          </p>
                        ) : (
                          <p className="text-amber-700">
                            Your energy consumption exceeds generation, resulting in a negative energy balance.
                            Consider energy efficiency measures or increasing renewable generation capacity.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Generation vs. Consumption</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Consumption', value: energyBalanceData.consumption },
                            { name: 'Generation', value: energyBalanceData.generation },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `${value.toLocaleString()} kWh`} />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-2">Energy Efficiency</h4>
                      <div className="p-4 border rounded-md bg-blue-50">
                        <div className="flex justify-between mb-2">
                          <span>Self-sufficiency ratio:</span>
                          <span className="font-semibold">
                            {(energyBalanceData.generation / energyBalanceData.consumption * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Grid dependency:</span>
                          <span className="font-semibold">
                            {(Math.max(0, energyBalanceData.consumption - energyBalanceData.generation) / energyBalanceData.consumption * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}