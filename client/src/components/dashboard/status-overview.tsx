import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  Eye,
  Check,
  Clock,
  TrendingDown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Alert, WorkPermit } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function StatusOverview() {
  // Fetch alerts
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  // Fetch permits
  const { data: permits = [] } = useQuery<WorkPermit[]>({
    queryKey: ["/api/permits"],
  });

  // Calculate stats for permits
  const activePermits = permits.filter(p => p.status === "approved" || p.status === "pending" || p.status === "critical");
  const approvedPermits = permits.filter(p => p.status === "approved").length;
  const pendingPermits = permits.filter(p => p.status === "pending").length;
  const criticalPermits = permits.filter(p => p.status === "critical").length;

  // Get next expiring permit
  const now = new Date();
  const nextExpiringPermit = [...activePermits]
    .filter(p => new Date(p.endDate) > now)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0];
  
  const getTimeRemaining = () => {
    if (!nextExpiringPermit) return "N/A";
    
    const endDate = new Date(nextExpiringPermit.endDate);
    const diffMs = endDate.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  // Simulated power load data (would come from measurements API in production)
  const currentLoad = 78.2; // MW
  const maxLoad = 100; // MW

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Grid Status Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-700 font-medium">Grid Status</h3>
            <Badge variant="outline" className="bg-green-500 bg-opacity-10 text-green-600 hover:bg-green-500 hover:bg-opacity-10">
              Operational
            </Badge>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-neutral-800">99.8%</div>
            <div className="text-sm text-neutral-500">Current Availability</div>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-neutral-600 flex items-center">
              <Activity className="h-4 w-4 mr-1" /> Last incident: 7d ago
            </span>
            <Link href="/analytics" className="text-primary-600 hover:text-primary-800 font-medium">
              View details
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Power Load Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-700 font-medium">Power Load</h3>
            <Badge variant="outline" className="bg-amber-500 bg-opacity-10 text-amber-600 hover:bg-amber-500 hover:bg-opacity-10">
              High Peak
            </Badge>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-neutral-800">{currentLoad.toFixed(1)} MW</div>
            <div className="text-sm text-neutral-500">Current Consumption</div>
          </div>
          <div className="mt-2 h-8">
            <Progress value={(currentLoad / maxLoad) * 100} className="h-2" indicatorClassName="bg-amber-500" />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>0 MW</span>
              <span>{maxLoad} MW</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Loss Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-700 font-medium">Energy Loss</h3>
            <Badge variant="outline" className="bg-green-500 bg-opacity-10 text-green-600 hover:bg-green-500 hover:bg-opacity-10">
              Optimized
            </Badge>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-neutral-800">3.2%</div>
            <div className="text-sm text-neutral-500">24h Average Loss</div>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-green-600 flex items-center">
              <TrendingDown className="h-4 w-4 mr-1" />
              2.1% from last week
            </span>
            <Link href="/analytics" className="text-primary-600 hover:text-primary-800 font-medium">
              Analysis
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Permits Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-700 font-medium">Active Permits</h3>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-medium">
              {activePermits.length}
            </div>
          </div>
          <div className="mt-2">
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-green-500 bg-opacity-10 text-green-600 hover:bg-green-500 hover:bg-opacity-10 whitespace-nowrap">
                <Check className="h-3 w-3 mr-1" /> {approvedPermits} Approved
              </Badge>
              <Badge variant="outline" className="bg-amber-500 bg-opacity-10 text-amber-600 hover:bg-amber-500 hover:bg-opacity-10 whitespace-nowrap">
                <Clock className="h-3 w-3 mr-1" /> {pendingPermits} Pending
              </Badge>
              <Badge variant="outline" className="bg-red-500 bg-opacity-10 text-red-600 hover:bg-red-500 hover:bg-opacity-10 whitespace-nowrap">
                <AlertTriangle className="h-3 w-3 mr-1" /> {criticalPermits} Critical
              </Badge>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-neutral-600 flex items-center">
              <Eye className="h-4 w-4 mr-1" /> Next expiry: {getTimeRemaining()}
            </span>
            <Link href="/permits" className="text-primary-600 hover:text-primary-800 font-medium">
              Manage
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
