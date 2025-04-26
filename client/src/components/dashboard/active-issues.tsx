import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Alert } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ActiveIssuesProps {
  issues: Alert[];
}

export function ActiveIssues({ issues }: ActiveIssuesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const res = await apiRequest("PUT", `/api/alerts/${alertId}/resolve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Alert resolved",
        description: "The alert has been marked as resolved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to resolve alert",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  const handleResolve = (alertId: number) => {
    resolveAlertMutation.mutate(alertId);
  };
  
  // Get only active issues
  const activeIssues = issues.filter(issue => issue.status === "active");
  
  // Only operators and engineers can assign crews
  const canAssignCrew = user && (user.role === "operator" || user.role === "engineer" || user.role === "admin");
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Active Issues</CardTitle>
      </CardHeader>
      <CardContent>
        {activeIssues.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-neutral-500">No active issues</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeIssues.map((issue) => (
              <div 
                key={issue.id} 
                className={`p-2 border-l-4 rounded ${
                  issue.severity === "error" 
                    ? "border-error bg-red-50" 
                    : issue.severity === "warning"
                    ? "border-warning bg-yellow-50"
                    : "border-info bg-blue-50"
                }`}
              >
                <div className="flex justify-between">
                  <h3 className={`text-sm font-medium ${
                    issue.severity === "error" 
                      ? "text-error" 
                      : issue.severity === "warning"
                      ? "text-warning"
                      : "text-info"
                  }`}>
                    {issue.title}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {formatDistanceToNow(new Date(issue.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">{issue.description}</p>
                <div className="flex mt-2">
                  {canAssignCrew && (
                    <>
                      <button className="text-xs text-primary font-medium">Assign Crew</button>
                      <span className="mx-2 text-neutral-300">|</span>
                    </>
                  )}
                  <button 
                    className="text-xs text-primary font-medium"
                    onClick={() => handleResolve(issue.id)}
                  >
                    {resolveAlertMutation.isPending ? "Resolving..." : "Resolve Issue"}
                  </button>
                  <span className="mx-2 text-neutral-300">|</span>
                  <button className="text-xs text-primary font-medium">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeIssues.length > 0 && (
          <Button 
            variant="link" 
            size="sm" 
            className="mt-3 px-0 text-primary" 
            asChild
          >
            <a href="#">
              View All Issues
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
