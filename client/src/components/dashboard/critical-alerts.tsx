import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Check, MoreVertical, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Alert } from "@shared/schema";

export function CriticalAlerts() {
  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
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
      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-neutral-800">Critical Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-center h-48">
          <div className="animate-pulse text-neutral-400">Loading alerts...</div>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader className="p-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-neutral-800">Critical Alerts</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {displayAlerts.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-neutral-500">
            No critical alerts at this time
          </div>
        ) : (
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
                    {formatTimestamp(alert.timestamp.toString())}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="p-4 border-t border-gray-200 -mx-4 -mb-4 mt-2">
              <Link href="/analytics" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center">
                View All Alerts <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
