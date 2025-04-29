import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NetworkNode, NetworkConnection, NetworkMeter } from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NetworkMeterFormProps {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  selectedMeter?: NetworkMeter;
  selectedNode?: NetworkNode;
  selectedConnection?: NetworkConnection;
  onSuccess: () => void;
}

const meterSchema = z.object({
  meterId: z.string().min(3, "Meter ID must be at least 3 characters"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  connectionId: z.coerce.number(),
  nodeId: z.string().min(1, "Node ID is required"),
  direction: z.enum(["in", "out"]),
  location: z.string().min(3, "Location must be at least 3 characters"),
  type: z.string().min(1, "Type is required"),
  unit: z.string().min(1, "Unit is required"),
  value: z.coerce.number(),
  status: z.string().min(1, "Status is required"),
  x: z.coerce.number(),
  y: z.coerce.number(),
});

export function NetworkMeterForm({
  nodes,
  connections,
  selectedMeter,
  selectedNode,
  selectedConnection,
  onSuccess,
}: NetworkMeterFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form based on whether we're editing or creating
  const defaultValues = selectedMeter
    ? {
        ...selectedMeter,
        connectionId: selectedMeter.connectionId || 0,
        nodeId: selectedMeter.nodeId || "",
        value: selectedMeter.value || 0,
      }
    : {
        meterId: `METER-${Math.floor(Math.random() * 1000)}`,
        name: "New Meter",
        connectionId: selectedConnection?.id || 0,
        nodeId: selectedNode?.nodeId || "",
        direction: "in" as const,
        location: "Connection Point",
        type: "power",
        unit: "kW",
        value: 0,
        status: "active",
        x: selectedNode?.x || 0,
        y: selectedNode?.y || 0,
      };

  const form = useForm({
    resolver: zodResolver(meterSchema),
    defaultValues,
  });

  // Create or update meter mutation
  const mutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      if (selectedMeter) {
        const res = await apiRequest(
          "PUT",
          `/api/network/meters/${selectedMeter.id}`,
          data
        );
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/network/meters", data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network/meters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      toast({
        title: selectedMeter ? "Meter updated" : "Meter created",
        description: selectedMeter
          ? "The meter has been updated successfully."
          : "A new meter has been added to the network.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${selectedMeter ? "update" : "create"} meter: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof meterSchema>) => {
    mutation.mutate(data as any);
  };

  // Update x, y coordinates when node changes
  const handleNodeChange = (nodeId: string) => {
    const node = nodes.find(n => n.nodeId === nodeId);
    if (node) {
      form.setValue("x", node.x);
      form.setValue("y", node.y);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="meterId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meter ID</FormLabel>
                <FormControl>
                  <Input placeholder="METER-XXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Meter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nodeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Node</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleNodeChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select node" />
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
            name="connectionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connection</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select connection" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {connections.map((conn) => (
                      <SelectItem key={conn.id} value={conn.id.toString()}>
                        {conn.sourceNodeId} → {conn.targetNodeId} ({conn.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Direction</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="in">Input (In)</SelectItem>
                    <SelectItem value="out">Output (Out)</SelectItem>
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
                <FormLabel>Measurement Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="power">Power</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="voltage">Voltage</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    step="0.01"
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
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="kW">kW</SelectItem>
                    <SelectItem value="MW">MW</SelectItem>
                    <SelectItem value="kV">kV</SelectItem>
                    <SelectItem value="V">V</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                  </SelectContent>
                </Select>
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
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="fault">Fault</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Description</FormLabel>
                <FormControl>
                  <Input placeholder="Location description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : selectedMeter ? "Update Meter" : "Add Meter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}