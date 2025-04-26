import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ActivityLog } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface RecentActivitiesProps {
  activities: ActivityLog[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  // Function to render the appropriate icon based on severity and action
  const getActivityIcon = (activity: ActivityLog) => {
    if (activity.severity === "error") {
      return <span className="material-icons text-error text-sm">error</span>;
    } else if (activity.severity === "warning") {
      return <span className="material-icons text-warning text-sm">warning</span>;
    } else if (activity.action?.startsWith("USER_")) {
      return <span className="material-icons text-primary text-sm">person</span>;
    } else if (activity.action?.includes("EQUIPMENT")) {
      return <span className="material-icons text-secondary text-sm">settings</span>;
    } else if (activity.action?.includes("WORK_PERMIT")) {
      return <span className="material-icons text-accent text-sm">work</span>;
    } else if (activity.action?.includes("APPROVE")) {
      return <span className="material-icons text-success text-sm">check_circle</span>;
    } else {
      return <span className="material-icons text-info text-sm">info</span>;
    }
  };
  
  // Format the time
  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-neutral-500">No recent activities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex">
                {getActivityIcon(activity)}
                <div className="ml-2">
                  <p className="text-xs text-neutral-500">
                    {formatTime(activity.timestamp)}
                  </p>
                  <p className="text-sm">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          variant="link" 
          size="sm" 
          className="mt-3 px-0 text-primary" 
          asChild
        >
          <Link href="/reports/activity-log">
            View Activity Log
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
