import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export function SystemStatus() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });
  
  // Determine badge status
  const gridStatusBadge = getStatusBadge("stable");
  
  // Get alert counts (will use real data in a production app)
  const alerts = dashboardData?.activeAlerts || [];
  const warningAlerts = alerts.filter(alert => alert.severity === "warning").length;
  const errorAlerts = alerts.filter(alert => alert.severity === "error").length;
  
  // Get work permit count
  const activePermits = dashboardData?.activeWorkPermits?.length || 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Grid Stability</span>
            <Badge 
              variant="outline"
              className={cn(
                "text-xs rounded-full",
                gridStatusBadge.className
              )}
            >
              {gridStatusBadge.label}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Active Alerts</span>
            <Badge 
              variant="outline"
              className={cn(
                "text-xs rounded-full",
                warningAlerts > 0 ? "bg-warning-light text-warning" : "bg-success-light text-success"
              )}
            >
              {warningAlerts > 0 ? `${warningAlerts} Warnings` : "No Warnings"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Active Faults</span>
            <Badge 
              variant="outline"
              className={cn(
                "text-xs rounded-full",
                errorAlerts > 0 ? "bg-error-light text-error" : "bg-success-light text-success"
              )}
            >
              {errorAlerts > 0 ? `${errorAlerts} Fault${errorAlerts > 1 ? 's' : ''}` : "No Faults"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Work Permits</span>
            <Badge 
              variant="outline"
              className={cn(
                "text-xs rounded-full",
                activePermits > 0 ? "bg-accent-light text-accent-dark" : "bg-success-light text-success"
              )}
            >
              {activePermits > 0 ? `${activePermits} Active` : "None Active"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get badge styling based on status
function getStatusBadge(status: string) {
  switch (status) {
    case "stable":
      return {
        label: "Stable",
        className: "bg-success-light text-success"
      };
    case "warning":
      return {
        label: "Warning",
        className: "bg-warning-light text-warning"
      };
    case "critical":
      return {
        label: "Critical",
        className: "bg-error-light text-error"
      };
    default:
      return {
        label: "Unknown",
        className: "bg-neutral-200 text-neutral-600"
      };
  }
}
