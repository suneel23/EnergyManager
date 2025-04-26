import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface EquipmentSummary {
  transformers: { 
    total: number;
    online: number;
    offline: number;
  };
  circuitBreakers: { 
    total: number;
    closed: number;
    open: number;
  };
  feeders: { 
    total: number;
    normal: number;
    warning: number;
    fault: number;
  };
  maintenanceDue: number;
}

interface EquipmentStatusProps {
  equipmentSummary: EquipmentSummary;
}

export function EquipmentStatus({ equipmentSummary }: EquipmentStatusProps) {
  const { transformers, circuitBreakers, feeders, maintenanceDue } = equipmentSummary;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Equipment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Transformers</span>
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-success mr-1"></span>
              <span className="text-sm font-medium">{transformers.online} Online</span>
              {transformers.offline > 0 && (
                <>
                  <span className="inline-block w-3 h-3 rounded-full bg-neutral-300 mx-1"></span>
                  <span className="text-sm font-medium">{transformers.offline} Offline</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Circuit Breakers</span>
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-success mr-1"></span>
              <span className="text-sm font-medium">{circuitBreakers.closed} Closed</span>
              {circuitBreakers.open > 0 && (
                <>
                  <span className="inline-block w-3 h-3 rounded-full bg-error mx-1"></span>
                  <span className="text-sm font-medium">{circuitBreakers.open} Open</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Feeders</span>
            <div className="flex items-center flex-wrap justify-end">
              <div className="flex items-center mr-2">
                <span className="inline-block w-3 h-3 rounded-full bg-success mr-1"></span>
                <span className="text-sm font-medium">{feeders.normal} Normal</span>
              </div>
              {feeders.warning > 0 && (
                <div className="flex items-center mr-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-warning mx-1"></span>
                  <span className="text-sm font-medium">{feeders.warning} Warning</span>
                </div>
              )}
              {feeders.fault > 0 && (
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-error mx-1"></span>
                  <span className="text-sm font-medium">{feeders.fault} Fault</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Maintenance Due</span>
            {maintenanceDue > 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-light text-warning">
                {maintenanceDue} Items
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-light text-success">
                None
              </span>
            )}
          </div>
        </div>
        
        <Button 
          variant="link" 
          size="sm" 
          className="mt-3 px-0 text-primary" 
          asChild
        >
          <Link href="/equipment-inventory">
            View Equipment Inventory
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
