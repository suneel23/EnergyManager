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

  // Get node symbol based on type using comprehensive international IEC 60617 standard symbols
  const getNodeSymbol = (type: string, status: string, x: number, y: number) => {
    const color = getStatusColor(status);
    
    switch (type.toLowerCase()) {
      case "bus":
        // IEC 60617: Busbar symbol (horizontal line)
        return (
          <rect 
            x={x - 40} 
            y={y - 5} 
            width={80} 
            height={10} 
            fill={color} 
            stroke="#000" 
            strokeWidth={1.5}
            rx={2}
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
        // IEC 60617: Synchronous generator symbol
        return (
          <g>
            <circle 
              cx={x} 
              cy={y} 
              r={15} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight="bold"
              fill={color}>
              G
            </text>
          </g>
        );
      case "transformer":
        // IEC 60617: Transformer symbol (two circles)
        return (
          <g>
            <circle 
              cx={x - 8} 
              cy={y} 
              r={10} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            <circle 
              cx={x + 8} 
              cy={y} 
              r={10} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
          </g>
        );
      case "load":
        // IEC 60617: Load symbol (zigzag/resistor)
        return (
          <g>
            <path 
              d={`M ${x-15},${y} L ${x-10},${y-6} L ${x-5},${y+6} L ${x},${y-6} L ${x+5},${y+6} L ${x+10},${y-6} L ${x+15},${y}`} 
              stroke={color} 
              strokeWidth={1.5} 
              fill="none" 
            />
            <line 
              x1={x-15} 
              y1={y-8} 
              x2={x+15} 
              y2={y-8} 
              stroke={color} 
              strokeWidth={1}
            />
          </g>
        );
      case "capacitor":
        // IEC 60617: Capacitor symbol (parallel plates)
        return (
          <g>
            <line x1={x-12} y1={y-8} x2={x+12} y2={y-8} stroke={color} strokeWidth={1.5} />
            <line x1={x-12} y1={y+8} x2={x+12} y2={y+8} stroke={color} strokeWidth={1.5} />
            <line x1={x} y1={y-18} x2={x} y2={y-8} stroke={color} strokeWidth={1.5} />
            <line x1={x} y1={y+8} x2={x} y2={y+18} stroke={color} strokeWidth={1.5} />
          </g>
        );
      case "substation":
        // IEC 60617: Substation symbol (rectangle with diagonal corners)
        return (
          <g>
            <rect 
              x={x-20} 
              y={y-15} 
              width={40} 
              height={30} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            <line x1={x-20} y1={y-15} x2={x+20} y2={y+15} stroke={color} strokeWidth={0.8} />
            <line x1={x-20} y1={y+15} x2={x+20} y2={y-15} stroke={color} strokeWidth={0.8} />
            <text
              x={x}
              y={y+5}
              textAnchor="middle"
              fontSize={10}
              fill={color}>
              SUB
            </text>
          </g>
        );
      case "inductor":
        // IEC 60617: Inductor/reactor symbol (arch pattern)
        return (
          <g>
            <path 
              d={`M ${x-15},${y} 
                  Q ${x-10},${y-10} ${x-5},${y} 
                  Q ${x},${y-10} ${x+5},${y} 
                  Q ${x+10},${y-10} ${x+15},${y}`} 
              stroke={color} 
              strokeWidth={1.5} 
              fill="none" 
            />
            <line x1={x-15} y1={y} x2={x-15} y2={y+10} stroke={color} strokeWidth={1.5} />
            <line x1={x+15} y1={y} x2={x+15} y2={y+10} stroke={color} strokeWidth={1.5} />
          </g>
        );
      case "motor":
        // IEC 60617: Motor symbol (circle with M)
        return (
          <g>
            <circle 
              cx={x} 
              cy={y} 
              r={15} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight="bold"
              fill={color}>
              M
            </text>
          </g>
        );
      case "battery":
        // IEC 60617: Battery symbol
        return (
          <g>
            <line x1={x-15} y1={y-8} x2={x+15} y2={y-8} stroke={color} strokeWidth={1.5} />
            <line x1={x-10} y1={y} x2={x+10} y2={y} stroke={color} strokeWidth={3} />
            <line x1={x-15} y1={y+8} x2={x+15} y2={y+8} stroke={color} strokeWidth={1.5} />
            <line x1={x-10} y1={y+16} x2={x+10} y2={y+16} stroke={color} strokeWidth={3} />
            <line x1={x} y1={y-15} x2={x} y2={y-8} stroke={color} strokeWidth={1.5} />
            <line x1={x} y1={y+16} x2={x} y2={y+23} stroke={color} strokeWidth={1.5} />
          </g>
        );
      case "fuse":
        // IEC 60617: Fuse symbol
        return (
          <g>
            <rect 
              x={x-15} 
              y={y-8} 
              width={30} 
              height={16} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            <line 
              x1={x-10} 
              y1={y} 
              x2={x+10} 
              y2={y} 
              stroke={color} 
              strokeWidth={1}
              strokeDasharray={status.toLowerCase() === "open" ? "2,1" : "none"}
            />
          </g>
        );
      case "solar":
        // Solar panel symbol (not strictly IEC but commonly used)
        return (
          <g>
            <rect 
              x={x-18} 
              y={y-12} 
              width={36} 
              height={24} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            {/* Grid pattern for solar panel */}
            <line x1={x-18} y1={y-4} x2={x+18} y2={y-4} stroke={color} strokeWidth={0.8} />
            <line x1={x-18} y1={y+4} x2={x+18} y2={y+4} stroke={color} strokeWidth={0.8} />
            <line x1={x-6} y1={y-12} x2={x-6} y2={y+12} stroke={color} strokeWidth={0.8} />
            <line x1={x+6} y1={y-12} x2={x+6} y2={y+12} stroke={color} strokeWidth={0.8} />
            
            {/* Sun rays */}
            <path 
              d={`M ${x-24},${y-16} L ${x-18},${y-12}`} 
              stroke={color} 
              strokeWidth={1}
            />
            <path 
              d={`M ${x+24},${y-16} L ${x+18},${y-12}`} 
              stroke={color} 
              strokeWidth={1}
            />
          </g>
        );
      case "groundconnection":
        // IEC 60617: Ground connection symbol
        return (
          <g>
            <line x1={x} y1={y-10} x2={x} y2={y+10} stroke={color} strokeWidth={1.5} />
            <line x1={x-12} y1={y+10} x2={x+12} y2={y+10} stroke={color} strokeWidth={1.5} />
            <line x1={x-8} y1={y+15} x2={x+8} y2={y+15} stroke={color} strokeWidth={1.5} />
            <line x1={x-4} y1={y+20} x2={x+4} y2={y+20} stroke={color} strokeWidth={1.5} />
          </g>
        );
      default:
        // Default connection point
        return (
          <circle 
            cx={x} 
            cy={y} 
            r={5} 
            fill={color} 
            stroke="#000" 
            strokeWidth={1}
          />
        );
    }
  };

  // Get connection line based on type using comprehensive international IEC 60617 standard symbols
  const getConnectionLine = (connection: DiagramConnection) => {
    const { sourceX, sourceY, targetX, targetY, type, status } = connection;
    const color = getStatusColor(status);
    
    // Calculate angle for proper symbol orientation and midpoint
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI;
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    
    switch (type.toLowerCase()) {
      case "transformer":
        // IEC 60617: Two-winding transformer symbol
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
            <circle cx={midX - 10} cy={midY} r={10} fill="white" stroke={color} strokeWidth={1.5} />
            {/* Secondary winding */}
            <circle cx={midX + 10} cy={midY} r={10} fill="white" stroke={color} strokeWidth={1.5} />
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
      case "autotransformer":
        // IEC 60617: Autotransformer symbol
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={midX - 20} 
              y2={midY} 
              stroke={color} 
              strokeWidth={2}
            />
            <path
              d={`M ${midX-20},${midY} 
                  Q ${midX-10},${midY-12} ${midX},${midY} 
                  Q ${midX+10},${midY+12} ${midX+20},${midY}`}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
            />
            <line 
              x1={midX + 20} 
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
        const cbMidX = midX;
        const cbMidY = midY;
        
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
            
            {/* Circuit breaker symbol - improved with square container */}
            <rect
              x={cbMidX - 14}
              y={cbMidY - 14}
              width={28}
              height={28}
              fill="white"
              stroke={color}
              strokeWidth={0.8}
              strokeDasharray="3,2"
              rx={2}
            />
            
            {status.toLowerCase() === "open" ? (
              // Open circuit breaker
              <g>
                <line 
                  x1={cbMidX - 12} 
                  y1={cbMidY} 
                  x2={cbMidX - 3} 
                  y2={cbMidY - 8} 
                  stroke={color} 
                  strokeWidth={2}
                />
                <line 
                  x1={cbMidX + 3} 
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
            <circle cx={cbMidX - 12} cy={cbMidY} r={2.5} fill={color} stroke="none" />
            <circle cx={cbMidX + 12} cy={cbMidY} r={2.5} fill={color} stroke="none" />
            
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
      case "recloser":
        // Distribution recloser (automatic circuit breaker)
        const rMidX = midX;
        const rMidY = midY;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={rMidX - 12} 
              y2={rMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* Recloser symbol - circuit breaker with auto indication */}
            <rect
              x={rMidX - 16}
              y={rMidY - 16}
              width={32}
              height={32}
              fill="white"
              stroke={color}
              strokeWidth={0.8}
              rx={3}
            />
            
            {status.toLowerCase() === "open" ? (
              <g>
                <line 
                  x1={rMidX - 12} 
                  y1={rMidY} 
                  x2={rMidX - 4} 
                  y2={rMidY - 8} 
                  stroke={color} 
                  strokeWidth={2}
                />
                <line 
                  x1={rMidX + 4} 
                  y1={rMidY + 8} 
                  x2={rMidX + 12} 
                  y2={rMidY} 
                  stroke={color} 
                  strokeWidth={2}
                />
              </g>
            ) : (
              <line 
                x1={rMidX - 12} 
                y1={rMidY} 
                x2={rMidX + 12} 
                y2={rMidY} 
                stroke={color} 
                strokeWidth={2}
              />
            )}
            
            {/* Auto indication (small circle above) */}
            <circle cx={rMidX} cy={rMidY - 10} r={3} fill="none" stroke={color} strokeWidth={1} />
            <text x={rMidX} y={rMidY - 8} textAnchor="middle" fontSize={5} fill={color}>A</text>
            
            {/* Fixed contacts */}
            <circle cx={rMidX - 12} cy={rMidY} r={2} fill={color} stroke="none" />
            <circle cx={rMidX + 12} cy={rMidY} r={2} fill={color} stroke="none" />
            
            <line 
              x1={rMidX + 12} 
              y1={rMidY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
          </g>
        );
      case "disconnector":
        // IEC 60617: Disconnector/Isolator symbol
        const dMidX = midX;
        const dMidY = midY;
        
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
              // Open disconnector - pivot at one end
              <g>
                <line 
                  x1={dMidX - 15} 
                  y1={dMidY} 
                  x2={dMidX + 5} 
                  y2={dMidY - 15} 
                  stroke={color} 
                  strokeWidth={2}
                />
                <circle cx={dMidX - 15} cy={dMidY} r={2.5} fill={color} />
                <circle cx={dMidX + 15} cy={dMidY} r={2.5} fill={color} />
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
                <circle cx={dMidX - 15} cy={dMidY} r={2.5} fill={color} />
                <circle cx={dMidX + 15} cy={dMidY} r={2.5} fill={color} />
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
      case "earthing_switch":
        // IEC 60617: Earthing switch symbol
        const esMidX = midX;
        const esMidY = midY;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={esMidX - 15} 
              y2={esMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* Disconnector part */}
            {status.toLowerCase() === "open" ? (
              // Open earthing switch
              <g>
                <line 
                  x1={esMidX - 15} 
                  y1={esMidY} 
                  x2={esMidX} 
                  y2={esMidY - 15} 
                  stroke={color} 
                  strokeWidth={2}
                />
              </g>
            ) : (
              // Closed earthing switch with ground symbol
              <g>
                <line 
                  x1={esMidX - 15} 
                  y1={esMidY} 
                  x2={esMidX + 15} 
                  y2={esMidY} 
                  stroke={color} 
                  strokeWidth={2}
                />
                {/* Ground symbol */}
                <line x1={esMidX+15} y1={esMidY} x2={esMidX+15} y2={esMidY+10} stroke={color} strokeWidth={2} />
                <line x1={esMidX+8} y1={esMidY+10} x2={esMidX+22} y2={esMidY+10} stroke={color} strokeWidth={2} />
                <line x1={esMidX+10} y1={esMidY+15} x2={esMidX+20} y2={esMidY+15} stroke={color} strokeWidth={2} />
                <line x1={esMidX+12} y1={esMidY+20} x2={esMidX+18} y2={esMidY+20} stroke={color} strokeWidth={2} />
              </g>
            )}
            
            <circle cx={esMidX - 15} cy={esMidY} r={2.5} fill={color} />
            
            <line 
              x1={esMidX + 15} 
              y1={esMidY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
          </g>
        );
      case "fuse":
        // IEC 60617: Fuse symbol
        const fMidX = midX;
        const fMidY = midY;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={fMidX - 12} 
              y2={fMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* Fuse symbol - box with thin line inside */}
            <rect
              x={fMidX - 12}
              y={fMidY - 8}
              width={24}
              height={16}
              fill="white"
              stroke={color}
              strokeWidth={1.5}
              rx={2}
            />
            
            <line 
              x1={fMidX - 10} 
              y1={fMidY} 
              x2={fMidX + 10} 
              y2={fMidY} 
              stroke={color} 
              strokeWidth={1.5}
              strokeDasharray={status.toLowerCase() === "open" ? "2,1" : "none"}
            />
            
            <line 
              x1={fMidX + 12} 
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
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={3}
              strokeLinecap="round"
            />
            
            {/* Direction arrow for power flow */}
            <path
              d={`M ${midX-5},${midY-5} L ${midX+5},${midY} L ${midX-5},${midY+5} Z`}
              fill={color}
              stroke="none"
              transform={`rotate(${angle}, ${midX}, ${midY})`}
            />
          </g>
        );
      case "overhead_line":
        // Overhead line with poles indication
        const lineLength = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
        const numPoles = Math.floor(lineLength / 50) + 1; // Spacing poles roughly
        const dx = (targetX - sourceX) / numPoles;
        const dy = (targetY - sourceY) / numPoles;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2.5}
              strokeDasharray="7,3"
            />
            
            {/* Poles */}
            {Array.from({ length: numPoles - 1 }, (_, i) => {
              const poleX = sourceX + dx * (i + 1);
              const poleY = sourceY + dy * (i + 1);
              return (
                <g key={`pole-${i}`}>
                  <line 
                    x1={poleX-5} 
                    y1={poleY-5} 
                    x2={poleX+5} 
                    y2={poleY+5} 
                    stroke={color} 
                    strokeWidth={1.5}
                  />
                  <line 
                    x1={poleX-5} 
                    y1={poleY+5} 
                    x2={poleX+5} 
                    y2={poleY-5} 
                    stroke={color} 
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}
          </g>
        );
      case "underground_cable":
        // Underground cable line
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={3}
              strokeDasharray="10,4"
            />
            
            {/* Underground indication at midpoint */}
            <circle
              cx={midX}
              cy={midY}
              r={4}
              fill="white"
              stroke={color}
              strokeWidth={1}
            />
            <text
              x={midX}
              y={midY + 3}
              fontSize={6}
              textAnchor="middle"
              fill={color}
            >
              U
            </text>
          </g>
        );
      case "current_transformer":
        // IEC 60617: Current transformer symbol
        const ctMidX = midX;
        const ctMidY = midY;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={ctMidX - 15} 
              y2={ctMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* CT primary (straight line) */}
            <line 
              x1={ctMidX - 15} 
              y1={ctMidY} 
              x2={ctMidX + 15} 
              y2={ctMidY} 
              stroke={color} 
              strokeWidth={2.5}
            />
            
            {/* CT secondary (circle) */}
            <circle 
              cx={ctMidX} 
              cy={ctMidY + 10} 
              r={8} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            
            {/* Connection from primary to secondary */}
            <line 
              x1={ctMidX} 
              y1={ctMidY} 
              x2={ctMidX} 
              y2={ctMidY + 2} 
              stroke={color} 
              strokeWidth={1}
            />
            
            <line 
              x1={ctMidX + 15} 
              y1={ctMidY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* CT label */}
            <text
              x={ctMidX}
              y={ctMidY + 12}
              fontSize={6}
              textAnchor="middle"
              fill={color}
            >
              CT
            </text>
          </g>
        );
      case "voltage_transformer":
        // IEC 60617: Voltage transformer symbol
        const vtMidX = midX;
        const vtMidY = midY;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={vtMidX - 8} 
              y2={vtMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* VT primary and secondary winding circles */}
            <circle 
              cx={vtMidX - 8} 
              cy={vtMidY} 
              r={8} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            <circle 
              cx={vtMidX + 8} 
              cy={vtMidY} 
              r={8} 
              fill="white" 
              stroke={color} 
              strokeWidth={1.5}
            />
            
            <line 
              x1={vtMidX + 8} 
              y1={vtMidY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* VT label */}
            <text
              x={vtMidX}
              y={vtMidY - 12}
              fontSize={6}
              textAnchor="middle"
              fill={color}
            >
              VT
            </text>
          </g>
        );
      case "surge_arrester":
        // IEC 60617: Surge arrester / lightning arrester
        const saMidX = midX;
        const saMidY = midY;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={saMidX} 
              y2={saMidY - 10} 
              stroke={color} 
              strokeWidth={2}
            />
            
            {/* Surge arrester symbol - zigzag inside a box */}
            <rect
              x={saMidX - 10}
              y={saMidY - 10}
              width={20}
              height={20}
              fill="white"
              stroke={color}
              strokeWidth={1.5}
            />
            
            <path 
              d={`M ${saMidX-8},${saMidY-5} L ${saMidX-3},${saMidY+5} L ${saMidX+3},${saMidY-5} L ${saMidX+8},${saMidY+5}`} 
              stroke={color} 
              strokeWidth={1.5} 
              fill="none" 
            />
            
            <line 
              x1={saMidX} 
              y1={saMidY + 10} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
          </g>
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
