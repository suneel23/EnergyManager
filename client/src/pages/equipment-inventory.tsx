import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Equipment, InsertEquipment, insertEquipmentSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

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
import { Loader2, Plus, Search, Filter, Edit, Trash2 } from "lucide-react";

// Extended schema with validation
const equipmentFormSchema = insertEquipmentSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.string().min(1, "Equipment type is required"),
  location: z.string().min(1, "Location is required"),
  voltage: z.number().min(0, "Voltage must be a positive number"),
});

export default function EquipmentInventory() {
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  const { toast } = useToast();
  
  // Fetch equipment data
  const { data: equipment, isLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });
  
  // Form for adding/editing equipment
  const form = useForm<z.infer<typeof equipmentFormSchema>>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      type: "",
      location: "",
      voltage: 0,
      status: "operational",
      specifications: {},
      notes: "",
    },
  });
  
  // Create equipment mutation
  const createEquipmentMutation = useMutation({
    mutationFn: async (data: InsertEquipment) => {
      const res = await apiRequest("POST", "/api/equipment", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Equipment Added",
        description: "New equipment has been added successfully",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add equipment",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  // Update equipment mutation
  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertEquipment }) => {
      const res = await apiRequest("PUT", `/api/equipment/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Equipment Updated",
        description: "Equipment has been updated successfully",
      });
      setIsAddDialogOpen(false);
      setSelectedEquipment(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update equipment",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof equipmentFormSchema>) => {
    if (selectedEquipment) {
      updateEquipmentMutation.mutate({ id: selectedEquipment.id, data });
    } else {
      createEquipmentMutation.mutate(data);
    }
  };
  
  // Handle dialog open for editing
  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    
    // Reset form with equipment data
    form.reset({
      name: equipment.name,
      type: equipment.type,
      location: equipment.location,
      voltage: equipment.voltage,
      status: equipment.status,
      specifications: equipment.specifications || {},
      notes: equipment.notes || "",
      installationDate: equipment.installationDate ? new Date(equipment.installationDate) : undefined,
      lastMaintenanceDate: equipment.lastMaintenanceDate ? new Date(equipment.lastMaintenanceDate) : undefined,
      nextMaintenanceDate: equipment.nextMaintenanceDate ? new Date(equipment.nextMaintenanceDate) : undefined,
      manufacturerId: equipment.manufacturerId || "",
      serialNumber: equipment.serialNumber || "",
    });
    
    setIsAddDialogOpen(true);
  };
  
  // Handle dialog open for adding
  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    form.reset({
      name: "",
      type: "",
      location: "",
      voltage: 0,
      status: "operational",
      specifications: {},
      notes: "",
    });
    setIsAddDialogOpen(true);
  };
  
  // Filter and search equipment
  const filteredEquipment = equipment
    ? equipment
        .filter(item => 
          equipmentFilter === "all" || item.type === equipmentFilter
        )
        .filter(item => 
          !searchQuery || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    : [];
  
  // Status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-success-light text-success";
      case "warning":
        return "bg-warning-light text-warning";
      case "fault":
        return "bg-error-light text-error";
      case "maintenance":
        return "bg-info-light text-info";
      case "open":
        return "bg-error-light text-error";
      case "closed":
        return "bg-success-light text-success";
      default:
        return "bg-neutral-200 text-neutral-700";
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold">Equipment Inventory</h1>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search equipment..."
                className="pl-10 w-[240px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                <SelectItem value="transformer">Transformers</SelectItem>
                <SelectItem value="circuit_breaker">Circuit Breakers</SelectItem>
                <SelectItem value="feeder">Feeders</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button onClick={handleAddEquipment}>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Equipment List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredEquipment.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                No equipment found matching your criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Voltage (kV)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Maintenance</TableHead>
                      <TableHead>Next Maintenance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('_', ' ')}
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.voltage}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.lastMaintenanceDate 
                            ? formatDistanceToNow(new Date(item.lastMaintenanceDate), { addSuffix: true }) 
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {item.nextMaintenanceDate 
                            ? formatDistanceToNow(new Date(item.nextMaintenanceDate), { addSuffix: true }) 
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditEquipment(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-error"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add/Edit Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEquipment ? "Edit Equipment" : "Add New Equipment"}
            </DialogTitle>
            <DialogDescription>
              {selectedEquipment 
                ? "Update the equipment details below" 
                : "Fill out the form below to add new equipment to the inventory"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transformer">Transformer</SelectItem>
                          <SelectItem value="circuit_breaker">Circuit Breaker</SelectItem>
                          <SelectItem value="feeder">Feeder</SelectItem>
                          <SelectItem value="disconnector">Disconnector</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="voltage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voltage (kV)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter voltage" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                      </FormControl>
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="fault">Fault</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter serial number" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter additional notes" 
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
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createEquipmentMutation.isPending || updateEquipmentMutation.isPending}
                >
                  {(createEquipmentMutation.isPending || updateEquipmentMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedEquipment ? "Update Equipment" : "Add Equipment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
