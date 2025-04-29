import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";
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
  Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EnergyMeasurement } from "@shared/schema";

// Sample data for the chart (would come from API in production)
const generateDemoData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // Simulate daily load pattern
    const loadFactor = 0.6 + 0.4 * Math.sin((hour - 10) * Math.PI / 12);
    const randomFactor = 0.9 + Math.random() * 0.2;
    
    const inputPower = Math.round(92 * loadFactor * randomFactor * 10) / 10;
    const outputPower = Math.round(inputPower * (0.965 + Math.random() * 0.01) * 10) / 10;
    const losses = Math.round((inputPower - outputPower) * 10) / 10;
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inputPower,
      outputPower,
      losses
    });
  }
  
  return data;
};

export function EnergyFlowChart() {
  const [timeRange, setTimeRange] = useState("24");
  const demoData = generateDemoData();
  
  // This query would fetch real data in production
  const { data: measurementsQuery, isLoading } = useQuery<EnergyMeasurement[]>({
    queryKey: ["/api/measurements/EQ-1023"],
    // Disabled for demo to use the generated data
    enabled: false,
  });
  
  // Use demo data for this implementation
  const data = demoData;
  
  // Calculate energy statistics
  const latestData = data[data.length - 1];
  const inputPower = latestData?.inputPower || 0;
  const outputPower = latestData?.outputPower || 0;
  const efficiency = Math.round((outputPower / inputPower) * 1000) / 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Energy Flow Chart */}
      <Card className="col-span-2">
        <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium text-neutral-800">Energy Flow Monitoring</CardTitle>
          <div className="flex space-x-2">
            <Select 
              defaultValue={timeRange}
              onValueChange={(value) => setTimeRange(value)}
            >
              <SelectTrigger className="text-sm h-9 w-[140px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">Last 24 Hours</SelectItem>
                <SelectItem value="168">Last Week</SelectItem>
                <SelectItem value="720">Last Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis unit=" MW" />
                <Tooltip 
                  formatter={(value) => [`${value} MW`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="inputPower" 
                  name="Input Power" 
                  stackId="1"
                  stroke="#1976D2" 
                  fill="#1976D2" 
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="outputPower" 
                  name="Output Power" 
                  stackId="2"
                  stroke="#009688" 
                  fill="#009688" 
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="losses" 
                  name="Losses" 
                  stackId="3"
                  stroke="#FF8F00" 
                  fill="#FF8F00" 
                  fillOpacity={0.8}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-neutral-500">Input Power</div>
              <div className="text-xl font-medium text-neutral-800">{inputPower.toFixed(1)} MW</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Output Power</div>
              <div className="text-xl font-medium text-neutral-800">{outputPower.toFixed(1)} MW</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Efficiency</div>
              <div className="text-xl font-medium text-green-600">{efficiency}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Critical Alerts */}
      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-neutral-800">Critical Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <CriticalAlerts />
        </CardContent>
      </Card>
    </div>
  );
}

function CriticalAlerts() {
  const { data: alerts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/alerts"],
  });

  // Sort alerts by timestamp (newest first) and filter active/recent ones
  const sortedAlerts = [...alerts]
    .filter(alert => alert.status !== "resolved")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  // If we have resolved alerts, show one as an example
  const resolvedAlert = alerts.find(alert => alert.status === "resolved");

  // Combine alerts, placing resolved at the end
  const displayAlerts = sortedAlerts.concat(
    resolvedAlert ? [resolvedAlert] : []
  ).slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-pulse text-neutral-400">Loading alerts...</div>
      </div>
    );
  }

  if (displayAlerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-neutral-500">
        No critical alerts at this time
      </div>
    );
  }

  const getAlertTypeClasses = (type: string, status: string) => {
    if (status === "resolved") {
      return "bg-green-500 bg-opacity-10 border-green-500";
    }
    
    switch (type.toLowerCase()) {
      case "critical":
        return "bg-red-500 bg-opacity-10 border-red-500";
      case "warning":
        return "bg-amber-500 bg-opacity-10 border-amber-500";
      default:
        return "bg-blue-500 bg-opacity-10 border-blue-500";
    }
  };

  const getAlertIcon = (type: string, status: string) => {
    if (status === "resolved") {
      return <Check className="text-green-500" />;
    }
    
    switch (type.toLowerCase()) {
      case "critical":
        return <AlertTriangle className="text-red-500" />;
      case "warning":
        return <AlertTriangle className="text-amber-500" />;
      default:
        return <AlertTriangle className="text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <>
      {displayAlerts.map((alert, index) => (
        <div 
          key={index}
          className={`flex items-start p-3 ${getAlertTypeClasses(alert.type, alert.status)} border-l-4 rounded`}
        >
          <div className="mr-3">
            {getAlertIcon(alert.type, alert.status)}
          </div>
          <div className="flex-1">
            <div className="font-medium text-neutral-800">{alert.message}</div>
            <div className="text-sm text-neutral-600">
              Value: {alert.value}{alert.unit} {alert.threshold && `- ${alert.value > alert.threshold ? 'Exceeds' : 'Approaching'} threshold by ${Math.abs(((alert.value - alert.threshold) / alert.threshold * 100).toFixed(1))}%`}
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              {formatTimestamp(alert.timestamp)}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <div className="p-4 border-t border-gray-200 -mx-4 -mb-4 mt-2">
        <Link href="/alerts" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center">
          View All Alerts <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </>
  );
}

function Link({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
