import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkPermit } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, Eye } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface WorkPermitCardProps {
  workPermit: WorkPermit;
}

export function WorkPermitCard({ workPermit }: WorkPermitCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  
  // Determine if current user can approve permits
  const canApprove = user && (user.role === "admin" || user.role === "manager");
  // Determine if current user can update permits
  const canUpdate = user && (
    user.role === "admin" || 
    user.role === "manager" || 
    user.id === workPermit.requestedById
  );
  
  // Format date and time for display
  const formatDateTime = (date: Date) => {
    return format(new Date(date), "HH:mm, dd MMM yyyy");
  };
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Handle permit status change
  const updatePermitMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/work-permits/${id}`, {
        ...workPermit,
        status,
        approvedById: status === "approved" ? user?.id : workPermit.approvedById
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-permits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Permit Updated",
        description: "The work permit status has been updated successfully",
      });
      setUpdating(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      setUpdating(false);
    },
  });
  
  // Handle approval/rejection
  const handleStatusChange = (newStatus: string) => {
    setUpdating(true);
    updatePermitMutation.mutate({ id: workPermit.id, status: newStatus });
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="bg-accent text-white font-medium">
              {workPermit.permitNumber}
            </Badge>
            <h3 className="text-sm font-medium mt-2">{workPermit.title}</h3>
          </div>
          <Badge
            className={cn(
              "font-normal",
              getStatusBadge(workPermit.status)
            )}
          >
            {workPermit.status.replace('_', ' ')}
          </Badge>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-start">
            <span className="material-icons text-neutral-500 text-sm mr-2">schedule</span>
            <div>
              <p className="text-xs text-neutral-500">Duration</p>
              <p className="text-xs font-medium">
                {formatDateTime(workPermit.startTime)} - {formatDateTime(workPermit.endTime)}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="material-icons text-neutral-500 text-sm mr-2">person</span>
            <div>
              <p className="text-xs text-neutral-500">Responsible</p>
              <p className="text-xs font-medium">
                {/* In a real app, we would fetch the user details */}
                ID: {workPermit.requestedById} (Requester)
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="material-icons text-neutral-500 text-sm mr-2">location_on</span>
            <div>
              <p className="text-xs text-neutral-500">Location</p>
              <p className="text-xs font-medium">{workPermit.location}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          
          {workPermit.status === "pending" && canApprove && (
            <div className="space-x-2">
              <Button 
                variant="outline"
                size="sm"
                className="text-error"
                onClick={() => handleStatusChange("rejected")}
                disabled={updating}
              >
                Reject
              </Button>
              <Button 
                size="sm"
                className="bg-success hover:bg-success/90"
                onClick={() => handleStatusChange("approved")}
                disabled={updating}
              >
                Approve
              </Button>
            </div>
          )}
          
          {workPermit.status === "in_progress" && canUpdate && (
            <Button 
              variant="outline"
              size="sm"
              className="text-error flex items-center"
              onClick={() => handleStatusChange("completed")}
              disabled={updating}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
