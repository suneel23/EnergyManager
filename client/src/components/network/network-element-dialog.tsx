import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkNodeForm } from "./network-node-form";
import { NetworkConnectionForm } from "./network-connection-form";
import { NetworkMeterForm } from "./network-meter-form";
import { NetworkNode, NetworkConnection, NetworkMeter } from "@shared/schema";

interface NetworkElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: NetworkNode[];
  connections?: NetworkConnection[];
  selectedNode?: NetworkNode;
  selectedConnection?: NetworkConnection;
  selectedMeter?: NetworkMeter;
  defaultTab?: "node" | "connection" | "meter";
}

export function NetworkElementDialog({
  open,
  onOpenChange,
  nodes,
  connections = [],
  selectedNode,
  selectedConnection,
  selectedMeter,
  defaultTab = "node",
}: NetworkElementDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {selectedNode ? "Edit Network Node" : 
             selectedConnection ? "Edit Network Connection" : 
             selectedMeter ? "Edit Energy Meter" :
             "Add Network Element"}
          </DialogTitle>
          <DialogDescription>
            {selectedNode || selectedConnection || selectedMeter ? 
              "Edit the properties of this network element." : 
              "Add a new node, connection or meter to your network diagram."}
          </DialogDescription>
        </DialogHeader>

        {(selectedNode || selectedConnection || selectedMeter) ? (
          // Edit mode - show only the relevant form
          <>
            {selectedNode && (
              <NetworkNodeForm 
                node={selectedNode} 
                onSuccess={handleSuccess} 
                onCancel={() => onOpenChange(false)} 
              />
            )}
            {selectedConnection && (
              <NetworkConnectionForm 
                connection={selectedConnection} 
                nodes={nodes}
                onSuccess={handleSuccess} 
                onCancel={() => onOpenChange(false)} 
              />
            )}
            {selectedMeter && (
              <NetworkMeterForm
                selectedMeter={selectedMeter}
                nodes={nodes}
                connections={connections}
                onSuccess={handleSuccess}
              />
            )}
          </>
        ) : (
          // Create mode - show tabs for node, connection, and meter
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="node">Add Node</TabsTrigger>
              <TabsTrigger value="connection">Add Connection</TabsTrigger>
              <TabsTrigger value="meter">Add Meter</TabsTrigger>
            </TabsList>
            <TabsContent value="node" className="pt-4">
              <NetworkNodeForm 
                onSuccess={handleSuccess} 
                onCancel={() => onOpenChange(false)} 
              />
            </TabsContent>
            <TabsContent value="connection" className="pt-4">
              <NetworkConnectionForm 
                nodes={nodes}
                onSuccess={handleSuccess} 
                onCancel={() => onOpenChange(false)} 
              />
            </TabsContent>
            <TabsContent value="meter" className="pt-4">
              <NetworkMeterForm
                nodes={nodes}
                connections={connections}
                onSuccess={handleSuccess}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}