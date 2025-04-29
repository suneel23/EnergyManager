import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NetworkNode, NetworkConnection, NetworkMeter } from "@shared/schema";
import { 
  Circle, 
  Plus, 
  Minus, 
  Maximize, 
  Search, 
  Edit, 
  Trash2, 
  PlusCircle,
  FileSymlink,
  Activity,
  Gauge
} from "lucide-react";
import { NetworkElementDialog } from "./network-element-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DiagramNode extends NetworkNode {
  x: number;
  y: number;
}

interface DiagramConnection extends NetworkConnection {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export function SingleLineDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | undefined>();
  const [selectedConnection, setSelectedConnection] = useState<NetworkConnection | undefined>();
  const [defaultTab, setDefaultTab] = useState<"node" | "connection" | "meter">("node");
  const [selectedMeter, setSelectedMeter] = useState<NetworkMeter | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery<{nodes: NetworkNode[], connections: NetworkConnection[]}>({
    queryKey: ["/api/network"],
  });
  
  const { data: meters, isLoading: metersLoading } = useQuery<NetworkMeter[]>({
    queryKey: ["/api/network/meters"],
  });

  // Prepare diagram data
  const diagramNodes: DiagramNode[] = data?.nodes || [];
  const diagramConnections: DiagramConnection[] = (data?.connections || []).map(conn => {
    const source = diagramNodes.find(node => node.nodeId === conn.sourceNodeId);
    const target = diagramNodes.find(node => node.nodeId === conn.targetNodeId);
    
    return {
      ...conn,
      sourceX: source?.x || 0,
      sourceY: source?.y || 0,
      targetX: target?.x || 0,
      targetY: target?.y || 0
    };
  });

  // Zoom in
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  // Zoom out
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  // Reset zoom and pan
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only initiate drag if it's the main SVG and not an element
    if (e.currentTarget === e.target) {
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setOffset(prev => ({
        x: prev.x + (e.clientX - dragStart.x) / scale,
        y: prev.y + (e.clientY - dragStart.y) / scale
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Stop dragging
  const handleMouseUp = () => {
    setDragging(false);
  };

  // Mouse leave
  const handleMouseLeave = () => {
    setDragging(false);
  };

  // Get color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "energized":
      case "closed":
      case "operational":
        return "#388E3C"; // green-600
      case "de-energized":
      case "open":
        return "#9E9E9E"; // neutral-500
      case "fault":
        return "#D32F2F"; // red-600
      case "maintenance":
        return "#F57C00"; // orange-600
      default:
        return "#9E9E9E"; // neutral-500
    }
  };

  // Get node symbol based on type using international IEC 60617 standard symbols
  const getNodeSymbol = (type: string, status: string, x: number, y: number) => {
    const color = getStatusColor(status);
    
    switch (type.toLowerCase()) {
      case "bus":
        // IEC 60617: Busbar symbol (horizontal line)
        return (
          <rect 
            x={x - 35} 
            y={y - 4} 
            width={70} 
            height={8} 
            fill={color} 
            stroke="#000" 
            strokeWidth={1}
          />
        );
      case "junction":
        // IEC 60617: Connection point/node (filled circle)
        return (
          <g>
            <circle 
              cx={x} 
              cy={y} 
              r={5} 
              fill={color} 
              stroke="#000" 
              strokeWidth={1}
            />
            <circle 
              cx={x} 
              cy={y} 
              r={2} 
              fill="#000" 
              stroke="none"
            />
          </g>
        );
      case "generator":
        // IEC 60617: Generator symbol (circle with G)
        return (
          <g>
            <circle 
              cx={x} 
              cy={y} 
              r={12} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight="bold"
              fill={color}>
              G
            </text>
          </g>
        );
      case "load":
        // IEC 60617: Load symbol (zigzag/resistor)
        return (
          <g>
            <path 
              d={`M ${x-15},${y} L ${x-10},${y-5} L ${x-5},${y+5} L ${x},${y-5} L ${x+5},${y+5} L ${x+10},${y-5} L ${x+15},${y}`} 
              stroke={color} 
              strokeWidth={1.5} 
              fill="none" 
            />
          </g>
        );
      case "capacitor":
        // IEC 60617: Capacitor symbol
        return (
          <g>
            <line x1={x-10} y1={y} x2={x+10} y2={y} stroke={color} strokeWidth={1.5} />
            <line x1={x} y1={y-10} x2={x} y2={y+10} stroke={color} strokeWidth={1.5} />
          </g>
        );
      default:
        // Default connection point
        return (
          <circle 
            cx={x} 
            cy={y} 
            r={4} 
            fill={color} 
            stroke="#000" 
            strokeWidth={1}
          />
        );
    }
  };

  // Get connection line based on type using international IEC 60617 standard symbols
  const getConnectionLine = (connection: DiagramConnection) => {
    const { sourceX, sourceY, targetX, targetY, type, status } = connection;
    const color = getStatusColor(status);
    
    // Calculate angle for proper symbol orientation
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI;
    
    switch (type.toLowerCase()) {
      case "transformer":
        // IEC 60617: Two-winding transformer symbol
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={midX - 15} 
              y2={midY} 
              stroke={color} 
              strokeWidth={2}
            />
            {/* Primary winding */}
            <circle cx={midX - 10} cy={midY} r={8} fill="white" stroke={color} strokeWidth={1.5} />
            {/* Secondary winding */}
            <circle cx={midX + 10} cy={midY} r={8} fill="white" stroke={color} strokeWidth={1.5} />
            <line 
              x1={midX + 15} 
              y1={midY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
          </g>
        );
      case "circuit breaker":
        // IEC 60617: Circuit breaker symbol
        const cbMidX = (sourceX + targetX) / 2;
        const cbMidY = (sourceY + targetY) / 2;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={cbMidX - 12} 
              y2={cbMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* Circuit breaker symbol */}
            {status.toLowerCase() === "open" ? (
              // Open circuit breaker
              <g>
                <line 
                  x1={cbMidX - 12} 
                  y1={cbMidY} 
                  x2={cbMidX - 4} 
                  y2={cbMidY - 8} 
                  stroke={color} 
                  strokeWidth={2}
                />
                <line 
                  x1={cbMidX + 4} 
                  y1={cbMidY + 8} 
                  x2={cbMidX + 12} 
                  y2={cbMidY} 
                  stroke={color} 
                  strokeWidth={2}
                />
              </g>
            ) : (
              // Closed circuit breaker
              <line 
                x1={cbMidX - 12} 
                y1={cbMidY} 
                x2={cbMidX + 12} 
                y2={cbMidY} 
                stroke={color} 
                strokeWidth={2}
              />
            )}
            
            {/* Fixed contacts */}
            <circle cx={cbMidX - 12} cy={cbMidY} r={2} fill={color} stroke="none" />
            <circle cx={cbMidX + 12} cy={cbMidY} r={2} fill={color} stroke="none" />
            
            <line 
              x1={cbMidX + 12} 
              y1={cbMidY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
          </g>
        );
      case "disconnector":
        // IEC 60617: Disconnector/Isolator symbol
        const dMidX = (sourceX + targetX) / 2;
        const dMidY = (sourceY + targetY) / 2;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={dMidX - 15} 
              y2={dMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* Disconnector symbol */}
            {status.toLowerCase() === "open" ? (
              // Open disconnector
              <g>
                <line 
                  x1={dMidX - 15} 
                  y1={dMidY} 
                  x2={dMidX + 5} 
                  y2={dMidY - 15} 
                  stroke={color} 
                  strokeWidth={2}
                />
                <circle cx={dMidX - 15} cy={dMidY} r={2} fill={color} />
                <circle cx={dMidX + 15} cy={dMidY} r={2} fill={color} />
              </g>
            ) : (
              // Closed disconnector
              <g>
                <line 
                  x1={dMidX - 15} 
                  y1={dMidY} 
                  x2={dMidX + 15} 
                  y2={dMidY} 
                  stroke={color} 
                  strokeWidth={2}
                />
                <circle cx={dMidX - 15} cy={dMidY} r={2} fill={color} />
                <circle cx={dMidX + 15} cy={dMidY} r={2} fill={color} />
              </g>
            )}
            
            <line 
              x1={dMidX + 15} 
              y1={dMidY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
          </g>
        );
      case "fuse":
        // IEC 60617: Fuse symbol
        const fMidX = (sourceX + targetX) / 2;
        const fMidY = (sourceY + targetY) / 2;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={fMidX - 10} 
              y2={fMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* Fuse symbol - box with thin line inside */}
            <rect
              x={fMidX - 10}
              y={fMidY - 6}
              width={20}
              height={12}
              fill="white"
              stroke={color}
              strokeWidth={1.5}
            />
            
            <line 
              x1={fMidX - 8} 
              y1={fMidY} 
              x2={fMidX + 8} 
              y2={fMidY} 
              stroke={color} 
              strokeWidth={1}
              strokeDasharray={status.toLowerCase() === "open" ? "1,1" : "none"}
            />
            
            <line 
              x1={fMidX + 10} 
              y1={fMidY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
          </g>
        );
      case "line":
        // IEC 60617: 3-phase line (represented as single thick line)
        return (
          <line 
            x1={sourceX} 
            y1={sourceY} 
            x2={targetX} 
            y2={targetY} 
            stroke={color} 
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      default:
        // Simple line for other connection types
        return (
          <line 
            x1={sourceX} 
            y1={sourceY} 
            x2={targetX} 
            y2={targetY} 
            stroke={color} 
            strokeWidth={2}
          />
        );
    }
  };

  // Delete node mutation
  const deleteNodeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/network/nodes/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Network node and associated connections deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      setSelectedNode(undefined);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete network node: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete connection mutation
  const deleteConnectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/network/connections/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Network connection deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      setSelectedConnection(undefined);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete network connection: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete meter mutation
  const deleteMeterMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/network/meters/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Network meter deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network/meters"] });
      setSelectedMeter(undefined);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete network meter: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Get meter symbol based on type, direction and value using IEC 60617 standards
  const getMeterSymbol = (meter: NetworkMeter) => {
    const { x, y, type, status, direction, value, unit } = meter;
    const color = getStatusColor(status);
    const textColor = status.toLowerCase() === "fault" ? "#D32F2F" : "#333333";
    
    // Calculate position offset based on direction
    const xOffset = direction === "in" ? -24 : 24;
    const yOffset = 0;
    
    return (
      <g 
        className="meter-symbol" 
        transform={`translate(${x + xOffset}, ${y + yOffset})`}
        onClick={(e) => handleMeterClick(e, meter)}
      >
        {/* IEC 60617 based meter symbols */}
        {type === "power" && (
          // Power meter symbol (wattmeter) - IEC 60617: square with W
          <g>
            <rect 
              x={-12} 
              y={-12} 
              width={24} 
              height={24} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
              rx={2}
            />
            <text 
              x={0} 
              y={4} 
              textAnchor="middle" 
              fontSize={14} 
              fontWeight="bold"
              fill={color}
            >
              W
            </text>
          </g>
        )}
        
        {type === "current" && (
          // Current meter symbol (ammeter) - IEC 60617: circle with A
          <g>
            <circle 
              cx={0} 
              cy={0} 
              r={12} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            <text 
              x={0} 
              y={4} 
              textAnchor="middle" 
              fontSize={14} 
              fontWeight="bold"
              fill={color}
            >
              A
            </text>
          </g>
        )}
        
        {type === "voltage" && (
          // Voltage meter symbol (voltmeter) - IEC 60617: circle with V
          <g>
            <circle 
              cx={0} 
              cy={0} 
              r={12} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            <text 
              x={0} 
              y={4} 
              textAnchor="middle" 
              fontSize={14} 
              fontWeight="bold"
              fill={color}
            >
              V
            </text>
          </g>
        )}
        
        {type !== "power" && type !== "current" && type !== "voltage" && (
          // Generic measurement symbol
          <g>
            <rect 
              x={-12} 
              y={-12} 
              width={24} 
              height={24} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
              rx={2}
            />
            <text 
              x={0} 
              y={4} 
              textAnchor="middle" 
              fontSize={12} 
              fontWeight="bold"
              fill={color}
            >
              M
            </text>
          </g>
        )}
        
        {/* Arrow indicating flow direction */}
        <path 
          d={direction === "in" 
            ? "M 14,-4 L 22,-4 L 22,-8 L 30,0 L 22,8 L 22,4 L 14,4 Z" // Arrow pointing right
            : "M -14,-4 L -22,-4 L -22,-8 L -30,0 L -22,8 L -22,4 L -14,4 Z" // Arrow pointing left
          } 
          fill={color}
          opacity={0.8}
        />
        
        {/* Value display */}
        <text 
          x={0} 
          y={20} 
          textAnchor="middle" 
          fontSize={10} 
          fill={textColor}
        >
          {value} {unit}
        </text>
        
        {/* Meter name */}
        <text 
          x={0} 
          y={32} 
          textAnchor="middle" 
          fontSize={8} 
          fill="#666666"
        >
          {meter.name}
        </text>
      </g>
    );
  };

  // Handle node click - just select it without opening dialog immediately
  const handleNodeClick = (e: React.MouseEvent, node: NetworkNode) => {
    e.stopPropagation(); // Prevent SVG drag from happening
    setSelectedNode(node);
    setSelectedConnection(undefined);
    setSelectedMeter(undefined);
  };

  // Handle connection click - just select it without opening dialog immediately
  const handleConnectionClick = (e: React.MouseEvent, connection: NetworkConnection) => {
    e.stopPropagation(); // Prevent SVG drag from happening
    setSelectedConnection(connection);
    setSelectedNode(undefined);
    setSelectedMeter(undefined);
  };
  
  // Handle meter click - select the meter
  const handleMeterClick = (e: React.MouseEvent, meter: NetworkMeter) => {
    e.stopPropagation(); // Prevent SVG drag from happening
    setSelectedMeter(meter);
    setSelectedNode(undefined);
    setSelectedConnection(undefined);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedNode) {
      deleteNodeMutation.mutate(selectedNode.id);
    } else if (selectedConnection) {
      deleteConnectionMutation.mutate(selectedConnection.id);
    } else if (selectedMeter) {
      deleteMeterMutation.mutate(selectedMeter.id);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <Card className="shadow">
      <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-neutral-800">Distribution Network Diagram</CardTitle>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2 text-sm">
            <Badge variant="outline" className="flex items-center bg-green-500 bg-opacity-10 text-green-700">
              <Circle className="h-2 w-2 fill-current text-green-500 mr-1" /> Energized
            </Badge>
            <Badge variant="outline" className="flex items-center bg-gray-200 bg-opacity-10 text-gray-700">
              <Circle className="h-2 w-2 fill-current text-gray-400 mr-1" /> De-energized
            </Badge>
            <Badge variant="outline" className="flex items-center bg-red-500 bg-opacity-10 text-red-700">
              <Circle className="h-2 w-2 fill-current text-red-500 mr-1" /> Fault
            </Badge>
            <Badge variant="outline" className="flex items-center bg-amber-500 bg-opacity-10 text-amber-700">
              <Circle className="h-2 w-2 fill-current text-amber-500 mr-1" /> Maintenance
            </Badge>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setDefaultTab("node");
              setSelectedNode(undefined);
              setSelectedConnection(undefined);
              setDialogOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Element
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-[600px] relative bg-gray-50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-neutral-400">Loading network diagram...</div>
          </div>
        ) : (
          <>
            {/* Diagram controls */}
            <div className="absolute top-4 left-4 z-10 p-2 flex flex-col space-y-2 bg-white rounded shadow">
              <Button variant="outline" size="icon" onClick={zoomIn}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={zoomOut}>
                <Minus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={resetView}>
                <Maximize className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Management controls */}
            <div className="absolute top-4 right-4 z-10 p-2 bg-white rounded shadow">
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={!selectedNode && !selectedConnection && !selectedMeter}
                  onClick={() => setDialogOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Selected
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={!selectedNode && !selectedConnection && !selectedMeter}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDefaultTab("connection");
                    setSelectedNode(undefined);
                    setSelectedConnection(undefined);
                    setSelectedMeter(undefined);
                    setDialogOpen(true);
                  }}
                >
                  <FileSymlink className="h-4 w-4 mr-2" />
                  Add Connection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDefaultTab("meter");
                    setSelectedNode(undefined);
                    setSelectedConnection(undefined);
                    setSelectedMeter(undefined);
                    setDialogOpen(true);
                  }}
                >
                  <Gauge className="h-4 w-4 mr-2" />
                  Add Meter
                </Button>
              </div>
            </div>
            
            {/* SVG Diagram */}
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              className={dragging ? "cursor-grabbing" : "cursor-grab"}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
                {/* Connection lines */}
                {diagramConnections.map((connection, index) => (
                  <g 
                    key={`connection-${index}`}
                    onClick={(e) => handleConnectionClick(e, connection)}
                    style={{ cursor: "pointer" }}
                    className={selectedConnection?.id === connection.id ? "opacity-70" : ""}
                  >
                    {getConnectionLine(connection)}
                    {/* Interactive overlay for better click target */}
                    <line 
                      x1={connection.sourceX} 
                      y1={connection.sourceY} 
                      x2={connection.targetX} 
                      y2={connection.targetY} 
                      stroke="transparent" 
                      strokeWidth={10}
                    />
                  </g>
                ))}
                
                {/* Nodes */}
                {diagramNodes.map((node, index) => (
                  <g 
                    key={`node-${index}`}
                    onClick={(e) => handleNodeClick(e, node)}
                    style={{ cursor: "pointer" }}
                    className={selectedNode?.id === node.id ? "opacity-70" : ""}
                  >
                    {getNodeSymbol(node.type, node.status, node.x, node.y)}
                    <text
                      x={node.x}
                      y={node.y + 20}
                      textAnchor="middle"
                      fill="#000"
                      fontSize={12}
                      pointerEvents="none"
                    >
                      {node.label}
                    </text>
                    {/* Show selection indicator if selected */}
                    {selectedNode?.id === node.id && (
                      <circle 
                        cx={node.x} 
                        cy={node.y} 
                        r={12} 
                        fill="none" 
                        stroke="#2563EB" 
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                    )}
                  </g>
                ))}
                
                {/* Meters */}
                {meters && meters.map((meter, index) => (
                  <g
                    key={`meter-${index}`}
                    className={selectedMeter?.id === meter.id ? "opacity-70" : ""}
                  >
                    {getMeterSymbol(meter)}
                    {/* Show selection indicator if selected */}
                    {selectedMeter?.id === meter.id && (
                      <circle 
                        cx={meter.x + (meter.direction === "in" ? -20 : 20)}
                        cy={meter.y}
                        r={14} 
                        fill="none" 
                        stroke="#2563EB" 
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                    )}
                  </g>
                ))}
              </g>
            </svg>

            {dialogOpen && (
              <NetworkElementDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                nodes={diagramNodes}
                connections={diagramConnections}
                selectedNode={selectedNode}
                selectedConnection={selectedConnection}
                selectedMeter={selectedMeter}
                defaultTab={defaultTab}
              />
            )}

            {deleteDialogOpen && (
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {selectedNode ? 
                        "This will delete the selected network node and all its connections. This action cannot be undone." 
                        : selectedConnection ?
                        "This will delete the selected network connection. This action cannot be undone."
                        : "This will delete the selected energy meter. This action cannot be undone."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
