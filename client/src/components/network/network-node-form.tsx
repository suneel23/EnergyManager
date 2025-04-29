import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { insertNetworkNodeSchema, NetworkNode } from "@shared/schema";
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
const formSchema = insertNetworkNodeSchema.extend({
  nodeId: z.string().min(3, {
    message: "Node ID must be at least 3 characters.",
  }),
  label: z.string().nullable().optional(),
  x: z.number().min(0).max(1000),
  y: z.number().min(0).max(1000),
});

type FormValues = z.infer<typeof formSchema>;

interface NetworkNodeFormProps {
  node?: NetworkNode;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NetworkNodeForm({ node, onSuccess, onCancel }: NetworkNodeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!node;

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nodeId: node?.nodeId || "",
      type: node?.type || "Bus",
      label: node?.label || "",
      voltageLevel: node?.voltageLevel || "",
      status: node?.status || "energized",
      x: node?.x || 100,
      y: node?.y || 100,
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/network/nodes", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Network node created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create network node: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("PUT", `/api/network/nodes/${node?.id}`, values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Network node updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update network node: ${error.message}`,
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
          name="nodeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Node ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g. BUS-110-1" 
                  {...field} 
                  disabled={isEditing} // Can't change nodeId when editing
                />
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
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select node type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Junction">Junction</SelectItem>
                  <SelectItem value="Connection Point">Connection Point</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g. 110kV Bus 1" 
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
          name="voltageLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voltage Level</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g. 110kV" 
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
                  <SelectItem value="energized">Energized</SelectItem>
                  <SelectItem value="de-energized">De-energized</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="fault">Fault</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="x"
            render={({ field }) => (
              <FormItem>
                <FormLabel>X Position</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="y"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Y Position</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            {isEditing ? "Update" : "Create"} Node
          </Button>
        </div>
      </form>
    </Form>
  );
}