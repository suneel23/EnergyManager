import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NetworkNode, NetworkConnection } from "@shared/schema";
import { Circle, Ellipsis, Plus, Minus, Maximize, Search } from "lucide-react";

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
  
  const { data, isLoading } = useQuery<{nodes: NetworkNode[], connections: NetworkConnection[]}>({
    queryKey: ["/api/network"],
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
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
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

  // Get node symbol based on type
  const getNodeSymbol = (type: string, status: string, x: number, y: number) => {
    const color = getStatusColor(status);
    
    switch (type.toLowerCase()) {
      case "bus":
        return (
          <rect 
            x={x - 30} 
            y={y - 5} 
            width={60} 
            height={10} 
            fill={color} 
            stroke="#000" 
            strokeWidth={1}
          />
        );
      case "junction":
        return (
          <circle 
            cx={x} 
            cy={y} 
            r={6} 
            fill={color} 
            stroke="#000" 
            strokeWidth={1}
          />
        );
      default:
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

  // Get connection line based on type
  const getConnectionLine = (connection: DiagramConnection) => {
    const { sourceX, sourceY, targetX, targetY, type, status } = connection;
    const color = getStatusColor(status);
    
    switch (type.toLowerCase()) {
      case "transformer":
        // Draw a line with transformer symbol in the middle
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={midX - 10} 
              y2={midY} 
              stroke={color} 
              strokeWidth={2}
            />
            <circle cx={midX} cy={midY} r={10} fill="white" stroke={color} strokeWidth={2} />
            <line 
              x1={midX + 10} 
              y1={midY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
          </g>
        );
      case "circuit breaker":
        // Draw a line with circuit breaker symbol
        const cbMidX = (sourceX + targetX) / 2;
        const cbMidY = (sourceY + targetY) / 2;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={cbMidX - 10} 
              y2={cbMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            <rect 
              x={cbMidX - 10} 
              y={cbMidY - 6} 
              width={20} 
              height={12} 
              fill="white" 
              stroke={color} 
              strokeWidth={2}
            />
            <line 
              x1={cbMidX + 10} 
              y1={cbMidY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
            {status.toLowerCase() === "open" && (
              <line 
                x1={cbMidX - 5} 
                y1={cbMidY - 5} 
                x2={cbMidX + 5} 
                y2={cbMidY + 5} 
                stroke={color} 
                strokeWidth={2}
              />
            )}
          </g>
        );
      case "disconnector":
        // Draw a line with disconnector symbol
        const dMidX = (sourceX + targetX) / 2;
        const dMidY = (sourceY + targetY) / 2;
        
        return (
          <g>
            <line 
              x1={sourceX} 
              y1={sourceY} 
              x2={dMidX - 10} 
              y2={dMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            <line 
              x1={dMidX - 10} 
              y1={dMidY} 
              x2={dMidX + 10} 
              y2={dMidY} 
              stroke={color} 
              strokeWidth={2}
            />
            <line 
              x1={dMidX + 10} 
              y1={dMidY} 
              x2={targetX} 
              y2={targetY} 
              stroke={color} 
              strokeWidth={2}
            />
            {status.toLowerCase() === "open" && (
              <line 
                x1={dMidX} 
                y1={dMidY} 
                x2={dMidX + 5} 
                y2={dMidY - 10} 
                stroke={color} 
                strokeWidth={2}
              />
            )}
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
          <Button variant="outline" size="icon">
            <Maximize className="h-4 w-4" />
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
            
            {/* SVG Diagram */}
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              className="cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
                {/* Connection lines */}
                {diagramConnections.map((connection, index) => (
                  <g key={`connection-${index}`}>
                    {getConnectionLine(connection)}
                  </g>
                ))}
                
                {/* Nodes */}
                {diagramNodes.map((node, index) => (
                  <g key={`node-${index}`}>
                    {getNodeSymbol(node.type, node.status, node.x, node.y)}
                    <text
                      x={node.x}
                      y={node.y + 20}
                      textAnchor="middle"
                      fill="#000"
                      fontSize={12}
                    >
                      {node.label}
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          </>
        )}
      </CardContent>
    </Card>
  );
}
