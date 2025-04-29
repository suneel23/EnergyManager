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
import { NetworkNode, NetworkConnection } from "@shared/schema";

interface NetworkElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: NetworkNode[];
  selectedNode?: NetworkNode;
  selectedConnection?: NetworkConnection;
  defaultTab?: "node" | "connection";
}

export function NetworkElementDialog({
  open,
  onOpenChange,
  nodes,
  selectedNode,
  selectedConnection,
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
             "Add Network Element"}
          </DialogTitle>
          <DialogDescription>
            {selectedNode || selectedConnection ? 
              "Edit the properties of this network element." : 
              "Add a new node or connection to your network diagram."}
          </DialogDescription>
        </DialogHeader>

        {(selectedNode || selectedConnection) ? (
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
          </>
        ) : (
          // Create mode - show tabs for node and connection
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="node">Add Node</TabsTrigger>
              <TabsTrigger value="connection">Add Connection</TabsTrigger>
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
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}