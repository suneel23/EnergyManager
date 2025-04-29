import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { insertNetworkConnectionSchema, NetworkConnection, NetworkNode } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import { Loader2 } from "lucide-react";

// Extend the insert schema with more validation
const formSchema = insertNetworkConnectionSchema.extend({
  sourceNodeId: z.string().min(1, { message: "Source node is required" }),
  targetNodeId: z.string().min(1, { message: "Target node is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface NetworkConnectionFormProps {
  connection?: NetworkConnection;
  nodes: NetworkNode[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NetworkConnectionForm({ 
  connection, 
  nodes, 
  onSuccess, 
  onCancel 
}: NetworkConnectionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!connection;

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceNodeId: connection?.sourceNodeId || "",
      targetNodeId: connection?.targetNodeId || "",
      type: connection?.type || "Line",
      equipmentId: connection?.equipmentId || "",
      status: connection?.status || "closed",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/network/connections", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Network connection created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create network connection: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("PUT", `/api/network/connections/${connection?.id}`, values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Network connection updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update network connection: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sourceNodeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Node</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source node" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.nodeId} value={node.nodeId}>
                      {node.label || node.nodeId} ({node.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetNodeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Node</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target node" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.nodeId} value={node.nodeId}>
                      {node.label || node.nodeId} ({node.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select connection type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Line">Line</SelectItem>
                  <SelectItem value="Transformer">Transformer</SelectItem>
                  <SelectItem value="Circuit Breaker">Circuit Breaker</SelectItem>
                  <SelectItem value="Disconnector">Disconnector</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment ID (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g. EQ-1023" 
                  {...field} 
                  value={field.value || ""} 
                  disabled={isPending}
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
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="fault">Fault</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update" : "Create"} Connection
          </Button>
        </div>
      </form>
    </Form>
  );
}