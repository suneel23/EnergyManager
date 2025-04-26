import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SingleLineDiagramProps {
  region: string;
  showLabels: boolean;
  viewMode: string;
  className?: string;
}

export function SingleLineDiagram({ 
  region, 
  showLabels, 
  viewMode, 
  className 
}: SingleLineDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Initialize diagram and handle interactions
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    // Add interactive elements behavior
    const substations = svg.querySelectorAll('.substation');
    const circuitBreakers = svg.querySelectorAll('.circuit-breakers rect');
    const feeders = svg.querySelectorAll('.distribution-feeders rect');
    
    const interactiveElements = [...substations, ...circuitBreakers, ...feeders];
    
    const addInteractivity = (element: Element) => {
      element.addEventListener('mouseover', () => {
        element.setAttribute('data-hovered', 'true');
        element.classList.add('cursor-pointer');
        
        // Enhance stroke width for highlighting
        const shapes = element.querySelectorAll('rect, circle, path');
        shapes.forEach(shape => {
          const original = shape.getAttribute('stroke-width') || '2';
          shape.setAttribute('data-original-stroke-width', original);
          shape.setAttribute('stroke-width', '3');
        });
      });
      
      element.addEventListener('mouseout', () => {
        element.removeAttribute('data-hovered');
        
        // Restore original stroke width
        const shapes = element.querySelectorAll('rect, circle, path');
        shapes.forEach(shape => {
          const original = shape.getAttribute('data-original-stroke-width') || '2';
          shape.setAttribute('stroke-width', original);
        });
      });
      
      element.addEventListener('click', () => {
        const elementId = element.getAttribute('data-id');
        console.log(`Selected element: ${elementId}`);
        
        // Here we would normally display detailed information about the element
        // or open a modal with more data
      });
    };
    
    interactiveElements.forEach(addInteractivity);
    
    // Apply view mode
    applyViewMode(svg, viewMode);
    
    // Show/hide labels
    const textElements = svg.querySelectorAll('text');
    textElements.forEach(text => {
      text.style.display = showLabels ? 'block' : 'none';
    });
    
    // Apply region filter
    applyRegionFilter(svg, region);
    
    return () => {
      // Cleanup event listeners if needed
      interactiveElements.forEach(element => {
        element.removeEventListener('mouseover', () => {});
        element.removeEventListener('mouseout', () => {});
        element.removeEventListener('click', () => {});
      });
    };
  }, [region, showLabels, viewMode]);
  
  // Helper function to apply view mode
  const applyViewMode = (svg: SVGSVGElement, mode: string) => {
    switch (mode) {
      case 'voltage':
        // Default view - no changes needed
        break;
      case 'load':
        // Highlight elements based on load
        const feeders = svg.querySelectorAll('.distribution-feeders circle');
        feeders.forEach(feeder => {
          // In a real implementation, we would color based on actual load data
          const randomLoad = Math.random();
          if (randomLoad > 0.7) {
            feeder.setAttribute('fill', '#FFCDD2'); // High load - reddish
          } else if (randomLoad > 0.4) {
            feeder.setAttribute('fill', '#FFF9C4'); // Medium load - yellowish
          } else {
            feeder.setAttribute('fill', '#C8E6C9'); // Low load - greenish
          }
        });
        break;
      case 'status':
        // No additional changes for demo
        break;
    }
  };
  
  // Helper function to filter by region
  const applyRegionFilter = (svg: SVGSVGElement, regionId: string) => {
    // In a real implementation, we would show/hide elements based on region
    // For this demo, we'll just log the selected region
    console.log(`Showing region: ${regionId}`);
  };
  
  return (
    <svg 
      ref={svgRef}
      className={cn("network-diagram border border-neutral-200 rounded", className)} 
      viewBox="0 0 1000 600"
    >
      {/* Main Grid Components */}
      
      {/* Substation A: 110/35kV */}
      <g className="substation" data-id="substation-a">
        <rect x="100" y="100" width="200" height="120" rx="5" fill="#E3F2FD" stroke="#1565C0" strokeWidth="2" />
        <text x="200" y="125" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1565C0">Substation A (110/35kV)</text>
        
        {/* Transformer representation */}
        <circle cx="150" cy="160" r="20" fill="#BBDEFB" stroke="#1565C0" strokeWidth="2" />
        <path d="M150 180 L150 140" stroke="#1565C0" strokeWidth="2" />
        <circle cx="250" cy="160" r="20" fill="#BBDEFB" stroke="#1565C0" strokeWidth="2" />
        <path d="M250 180 L250 140" stroke="#1565C0" strokeWidth="2" />
      </g>
      
      {/* Substation B: 35/10kV */}
      <g className="substation" data-id="substation-b">
        <rect x="400" y="100" width="200" height="120" rx="5" fill="#E3F2FD" stroke="#1565C0" strokeWidth="2" />
        <text x="500" y="125" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1565C0">Substation B (35/10kV)</text>
        
        {/* Transformer representation */}
        <circle cx="450" cy="160" r="20" fill="#BBDEFB" stroke="#1565C0" strokeWidth="2" />
        <path d="M450 180 L450 140" stroke="#1565C0" strokeWidth="2" />
        <circle cx="550" cy="160" r="20" fill="#BBDEFB" stroke="#1565C0" strokeWidth="2" />
        <path d="M550 180 L550 140" stroke="#1565C0" strokeWidth="2" />
      </g>
      
      {/* Substation C: 10/6kV */}
      <g className="substation" data-id="substation-c">
        <rect x="700" y="100" width="200" height="120" rx="5" fill="#E3F2FD" stroke="#1565C0" strokeWidth="2" />
        <text x="800" y="125" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1565C0">Substation C (10/6kV)</text>
        
        {/* Transformer representation */}
        <circle cx="750" cy="160" r="20" fill="#BBDEFB" stroke="#1565C0" strokeWidth="2" />
        <path d="M750 180 L750 140" stroke="#1565C0" strokeWidth="2" />
        <circle cx="850" cy="160" r="20" fill="#BBDEFB" stroke="#1565C0" strokeWidth="2" />
        <path d="M850 180 L850 140" stroke="#1565C0" strokeWidth="2" />
      </g>
      
      {/* Distribution Feeders */}
      <g className="distribution-feeders">
        {/* Feeder Group 1 */}
        <rect x="100" y="300" width="150" height="100" rx="5" fill="#E8F5E9" stroke="#388E3C" strokeWidth="2" />
        <text x="175" y="325" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2E7D32">Feeder Group 1</text>
        <circle cx="130" cy="360" r="15" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
        <circle cx="175" cy="360" r="15" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
        <circle cx="220" cy="360" r="15" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
        
        {/* Feeder Group 2 */}
        <rect x="350" y="300" width="150" height="100" rx="5" fill="#E8F5E9" stroke="#388E3C" strokeWidth="2" />
        <text x="425" y="325" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2E7D32">Feeder Group 2</text>
        <circle cx="380" cy="360" r="15" fill="#FFF9C4" stroke="#FBC02D" strokeWidth="2" /> {/* Yellow indicates warning */}
        <circle cx="425" cy="360" r="15" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
        <circle cx="470" cy="360" r="15" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
        
        {/* Feeder Group 3 */}
        <rect x="600" y="300" width="150" height="100" rx="5" fill="#E8F5E9" stroke="#388E3C" strokeWidth="2" />
        <text x="675" y="325" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2E7D32">Feeder Group 3</text>
        <circle cx="630" cy="360" r="15" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2" /> {/* Red indicates failure */}
        <circle cx="675" cy="360" r="15" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
        <circle cx="720" cy="360" r="15" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
        
        {/* Feeder Group 4 */}
        <rect x="350" y="450" width="150" height="100" rx="5" fill="#E8F5E9" stroke="#388E3C" strokeWidth="2" />
        <text x="425" y="475" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2E7D32">Feeder Group 4</text>
        <circle cx="380" cy="510" r="15" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
        <circle cx="425" cy="510" r="15" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
        <circle cx="470" cy="510" r="15" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
      </g>
      
      {/* Connection Lines */}
      <g className="connection-lines" stroke="#616E7C" strokeWidth="2">
        {/* A to B Connection */}
        <path d="M300 160 L400 160" />
        {/* B to C Connection */}
        <path d="M600 160 L700 160" />
        
        {/* A to Feeders */}
        <path d="M150 220 L150 300" />
        <path d="M250 220 L250 250 L175 250 L175 300" />
        
        {/* B to Feeders */}
        <path d="M450 220 L450 250 L425 250 L425 300" />
        <path d="M550 220 L550 250 L675 250 L675 300" />
        
        {/* Feeder interconnections */}
        <path d="M425 400 L425 450" />
      </g>
      
      {/* Circuit Breakers and Disconnectors */}
      <g className="circuit-breakers">
        {/* Circuit Breaker A-B */}
        <rect x="335" y="155" width="20" height="10" fill="#D32F2F" rx="2" data-id="cb-a-b" /> {/* Red = Open */}
        
        {/* Circuit Breaker B-C */}
        <rect x="635" y="155" width="20" height="10" fill="#388E3C" rx="2" data-id="cb-b-c" /> {/* Green = Closed */}
        
        {/* Various disconnectors */}
        <rect x="150" y="250" width="10" height="10" fill="#388E3C" rx="2" transform="rotate(90 150 250)" />
        <rect x="250" y="250" width="10" height="10" fill="#388E3C" rx="2" />
        <rect x="450" y="250" width="10" height="10" fill="#388E3C" rx="2" />
        <rect x="550" y="250" width="10" height="10" fill="#388E3C" rx="2" />
        <rect x="425" y="425" width="10" height="10" fill="#D32F2F" rx="2" /> {/* Red = Open */}
      </g>
      
      {/* Load Points */}
      <g className="load-points" stroke="#1F2933" strokeWidth="1">
        {/* Load 1 */}
        <rect x="100" y="450" width="100" height="50" rx="3" fill="#E1F5FE" stroke="#0288D1" strokeWidth="2" />
        <text x="150" y="480" textAnchor="middle" fontSize="12" fill="#0288D1">Industrial Load</text>
        <path d="M150 400 L150 450" stroke="#616E7C" strokeWidth="2" />
        
        {/* Load 2 */}
        <rect x="600" y="450" width="100" height="50" rx="3" fill="#E1F5FE" stroke="#0288D1" strokeWidth="2" />
        <text x="650" y="480" textAnchor="middle" fontSize="12" fill="#0288D1">Residential Area</text>
        <path d="M650 400 L650 450" stroke="#616E7C" strokeWidth="2" />
      </g>
      
      {/* Active Work Permit Zone */}
      <g className="work-permit-zone">
        <rect x="550" y="300" width="250" height="150" rx="5" fill="none" stroke="#FB8C00" strokeWidth="3" strokeDasharray="10,5" />
        <text x="675" y="290" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#FB8C00">ACTIVE WORK PERMIT #WP-2023-089</text>
      </g>
    </svg>
  );
}
