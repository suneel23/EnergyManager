import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Plus, Maximize } from "lucide-react";

interface DiagramToolbarProps {
  className?: string;
}

export function DiagramToolbar({ className }: DiagramToolbarProps) {
  // In a real implementation, these would control the SVG viewBox or transform
  const handleZoomIn = () => {
    console.log("Zoom in");
    // Implementation would adjust the viewBox or apply a transform to the SVG
  };
  
  const handleZoomOut = () => {
    console.log("Zoom out");
    // Implementation would adjust the viewBox or apply a transform to the SVG
  };
  
  const handleFitToScreen = () => {
    console.log("Fit to screen");
    // Implementation would reset the viewBox to show the entire diagram
  };
  
  return (
    <div 
      className={cn(
        "diagram-toolbar absolute top-4 right-4 z-10",
        className
      )}
    >
      <div className="zoom-controls flex flex-col bg-white rounded-lg shadow-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-neutral-100 rounded-t-lg" 
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Zoom In</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-neutral-100 border-t border-b border-neutral-200" 
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Zoom Out</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-neutral-100 rounded-b-lg" 
          onClick={handleFitToScreen}
        >
          <Maximize className="h-4 w-4" />
          <span className="sr-only">Fit to Screen</span>
        </Button>
      </div>
    </div>
  );
}
