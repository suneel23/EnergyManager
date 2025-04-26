import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export function EnergyFlowSummary() {
  const { data: energyReadings, isLoading } = useQuery({
    queryKey: ["/api/energy-readings"],
  });
  
  // In a real application, we would calculate these values from the energy readings
  // For now, we'll use fixed values that match the design
  const incomingPower = 85.7;
  const mediumVoltage = 42.3;
  const lowVoltage1 = 28.6;
  const lowVoltage2 = 12.8;
  const losses = 2.0;
  const lossPercentage = 2.3;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Energy Flow Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Incoming Power (110kV)</span>
              <span className="text-sm font-medium">{incomingPower.toFixed(1)} MW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Distribution Feeders (35kV)</span>
              <span className="text-sm font-medium">{mediumVoltage.toFixed(1)} MW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Distribution Feeders (10kV)</span>
              <span className="text-sm font-medium">{lowVoltage1.toFixed(1)} MW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Distribution Feeders (6kV)</span>
              <span className="text-sm font-medium">{lowVoltage2.toFixed(1)} MW</span>
            </div>
            <div className="flex justify-between items-center border-t border-neutral-200 pt-2">
              <span className="text-sm font-medium text-neutral-700">System Losses</span>
              <span className="text-sm font-medium text-error">
                {losses.toFixed(1)} MW ({lossPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
