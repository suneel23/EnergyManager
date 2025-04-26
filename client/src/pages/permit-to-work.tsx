import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { WorkPermit, InsertWorkPermit, insertWorkPermitSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

import {
  Card,
  CardContent,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Plus, 
  Search, 
  CalendarIcon, 
  AlertCircle, 
  CheckCircle, 
  XCircle 
} from "lucide-react";

// Extended schema with validation
const workPermitFormSchema = insertWorkPermitSchema.extend({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
});

export default function PermitToWork() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<WorkPermit | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch work permits data
  const { data: workPermits, isLoading } = useQuery<WorkPermit[]>({
    queryKey: ["/api/work-permits"],
  });
  
  // Form for creating/editing work permits
  const form = useForm<z.infer<typeof workPermitFormSchema>>({
    resolver: zodResolver(workPermitFormSchema),
    defaultValues: {
      permitNumber: `WP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      title: "",
      description: "",
      status: "pending",
      startTime: new Date(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      location: "",
      requestedById: user?.id || 0,
      safetyMeasures: "",
    },
  });
  
  // Create work permit mutation
  const createWorkPermitMutation = useMutation({
    mutationFn: async (data: InsertWorkPermit) => {
      const res = await apiRequest("POST", "/api/work-permits", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-permits"] });
      toast({
        title: "Work Permit Created",
        description: "New work permit has been created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create work permit",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  // Update work permit mutation
  const updateWorkPermitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertWorkPermit }) => {
      const res = await apiRequest("PUT", `/api/work-permits/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-permits"] });
      toast({
        title: "Work Permit Updated",
        description: "Work permit has been updated successfully",
      });
      setIsCreateDialogOpen(false);
      setSelectedPermit(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update work permit",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof workPermitFormSchema>) => {
    if (selectedPermit) {
      updateWorkPermitMutation.mutate({ id: selectedPermit.id, data });
    } else {
      createWorkPermitMutation.mutate(data);
    }
  };
  
  // Handle dialog open for creating
  const handleCreatePermit = () => {
    setSelectedPermit(null);
    form.reset({
      permitNumber: `WP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      title: "",
      description: "",
      status: "pending",
      startTime: new Date(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      location: "",
      requestedById: user?.id || 0,
      safetyMeasures: "",
      equipmentIds: [],
    });
    setIsCreateDialogOpen(true);
  };
  
  // Handle dialog open for editing
  const handleEditPermit = (permit: WorkPermit) => {
    setSelectedPermit(permit);
    
    // Reset form with permit data
    form.reset({
      permitNumber: permit.permitNumber,
      title: permit.title,
      description: permit.description,
      status: permit.status,
      startTime: new Date(permit.startTime),
      endTime: new Date(permit.endTime),
      location: permit.location,
      requestedById: permit.requestedById,
      approvedById: permit.approvedById,
      equipmentIds: permit.equipmentIds || [],
      safetyMeasures: permit.safetyMeasures || "",
    });
    
    setIsCreateDialogOpen(true);
  };
  
  // Filter permits based on tab and search
  const filteredPermits = workPermits
    ? workPermits
        .filter(permit => {
          if (activeTab === "active") return permit.status === "in_progress";
          if (activeTab === "pending") return permit.status === "pending";
          if (activeTab === "completed") return permit.status === "completed";
          return true;
        })
        .filter(permit =>
          !searchQuery ||
          permit.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          permit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          permit.location.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : [];
  
  // Status badge color
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
  
  // Handle permit approval/rejection
  const updatePermitStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const permit = workPermits?.find(p => p.id === id);
      if (!permit) throw new Error("Permit not found");
      
      const updatedPermit = {
        ...permit,
        status,
        approvedById: status === "approved" ? user?.id : permit.approvedById
      };
      
      const res = await apiRequest("PUT", `/api/work-permits/${id}`, updatedPermit);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-permits"] });
      toast({
        title: "Permit Updated",
        description: "The permit status has been updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update permit",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold">Permit to Work</h1>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search permits..."
                className="pl-10 w-[240px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button onClick={handleCreatePermit}>
              <Plus className="h-4 w-4 mr-2" />
              Create Permit
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Permits</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Permits</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>
                  {activeTab === "active" && "Active Work Permits"}
                  {activeTab === "pending" && "Permits Pending Approval"}
                  {activeTab === "completed" && "Completed Work Permits"}
                  {activeTab === "all" && "All Work Permits"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredPermits.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    No work permits found
                    {activeTab !== "all" && (
                      <Button 
                        variant="link" 
                        className="pl-1"
                        onClick={() => setActiveTab("all")}
                      >
                        View all permits
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permit #</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Requested By</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>End Time</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPermits.map((permit) => (
                          <TableRow key={permit.id}>
                            <TableCell className="font-medium">{permit.permitNumber}</TableCell>
                            <TableCell>{permit.title}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(permit.status)}>
                                {permit.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>User #{permit.requestedById}</TableCell>
                            <TableCell>{permit.location}</TableCell>
                            <TableCell>{format(new Date(permit.startTime), "MMM dd, yyyy HH:mm")}</TableCell>
                            <TableCell>{format(new Date(permit.endTime), "MMM dd, yyyy HH:mm")}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {permit.status === "pending" && (user?.role === "admin" || user?.role === "manager") && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-green-600"
                                      onClick={() => updatePermitStatus.mutate({ id: permit.id, status: "approved" })}
                                      disabled={updatePermitStatus.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-red-600"
                                      onClick={() => updatePermitStatus.mutate({ id: permit.id, status: "rejected" })}
                                      disabled={updatePermitStatus.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                
                                {permit.status === "approved" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-blue-600"
                                    onClick={() => updatePermitStatus.mutate({ id: permit.id, status: "in_progress" })}
                                    disabled={updatePermitStatus.isPending}
                                  >
                                    Start Work
                                  </Button>
                                )}
                                
                                {permit.status === "in_progress" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-purple-600"
                                    onClick={() => updatePermitStatus.mutate({ id: permit.id, status: "completed" })}
                                    disabled={updatePermitStatus.isPending}
                                  >
                                    Complete
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditPermit(permit)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create/Edit Work Permit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPermit ? "Edit Work Permit" : "Create New Work Permit"}
            </DialogTitle>
            <DialogDescription>
              {selectedPermit 
                ? "Update the work permit details below" 
                : "Fill out the form below to request a new work permit"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="permitNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permit Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        Automatically generated
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedPermit || !(user?.role === "admin" || user?.role === "manager")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter work permit title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter work location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal flex justify-between items-center"
                            >
                              {field.value ? (
                                format(field.value, "PPP HH:mm")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                const currentDate = new Date(field.value);
                                const newDate = new Date(date);
                                newDate.setHours(currentDate.getHours());
                                newDate.setMinutes(currentDate.getMinutes());
                                field.onChange(newDate);
                              }
                            }}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <Input
                              type="time"
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(field.value);
                                newDate.setHours(parseInt(hours));
                                newDate.setMinutes(parseInt(minutes));
                                field.onChange(newDate);
                              }}
                              value={format(field.value, "HH:mm")}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal flex justify-between items-center"
                            >
                              {field.value ? (
                                format(field.value, "PPP HH:mm")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                const currentDate = new Date(field.value);
                                const newDate = new Date(date);
                                newDate.setHours(currentDate.getHours());
                                newDate.setMinutes(currentDate.getMinutes());
                                field.onChange(newDate);
                              }
                            }}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <Input
                              type="time"
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(field.value);
                                newDate.setHours(parseInt(hours));
                                newDate.setMinutes(parseInt(minutes));
                                field.onChange(newDate);
                              }}
                              value={format(field.value, "HH:mm")}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      {isAfter(form.getValues("startTime"), form.getValues("endTime")) && (
                        <p className="text-sm font-medium text-error">End time must be after start time</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the work to be performed" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="safetyMeasures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Measures</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe safety measures to be implemented" 
                        className="min-h-[100px]" 
                        {...field}
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={
                    createWorkPermitMutation.isPending || 
                    updateWorkPermitMutation.isPending ||
                    isAfter(form.getValues("startTime"), form.getValues("endTime"))
                  }
                >
                  {(createWorkPermitMutation.isPending || updateWorkPermitMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedPermit ? "Update Permit" : "Create Permit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
