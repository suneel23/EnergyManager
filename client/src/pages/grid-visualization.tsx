import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SingleLineDiagram } from "@/components/network-diagram/single-line-diagram";
import { DiagramToolbar } from "@/components/network-diagram/diagram-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SystemStatus } from "@/components/dashboard/system-status";
import { ActiveIssues } from "@/components/dashboard/active-issues";
import { WorkPermitCard } from "@/components/dashboard/work-permit-card";
import { EnergyFlowSummary } from "@/components/dashboard/energy-flow-summary";
import { EquipmentStatus } from "@/components/dashboard/equipment-status";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Download } from "lucide-react";

export default function GridVisualization() {
  const [region, setRegion] = useState("region-1");
  const [showLabels, setShowLabels] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [viewMode, setViewMode] = useState("voltage");
  const [activeTab, setActiveTab] = useState("single-line");
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if auto-refresh is enabled
  });
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-semibold">Grid Visualization</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="single-line">Single Line Diagram</TabsTrigger>
            <TabsTrigger value="energy-flow">Energy Flow</TabsTrigger>
            <TabsTrigger value="substation-view">Substation View</TabsTrigger>
            <TabsTrigger value="distribution-feeders">Distribution Feeders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single-line" className="space-y-4">
            {/* Action Bar */}
            <Card>
              <CardContent className="p-3 flex flex-wrap items-center justify-between">
                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="region-1">Region 1 - North</SelectItem>
                      <SelectItem value="region-2">Region 2 - Central</SelectItem>
                      <SelectItem value="region-3">Region 3 - East</SelectItem>
                      <SelectItem value="region-4">Region 4 - West</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button size="sm" className="flex items-center">
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Refresh
                  </Button>
                  
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Download className="mr-1 h-4 w-4" />
                    Export
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="show-labels" className="text-sm">Show Labels</Label>
                    <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
                    <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                  </div>
                  
                  <Select value={viewMode} onValueChange={setViewMode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="View Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voltage">Voltage View</SelectItem>
                      <SelectItem value="load">Load View</SelectItem>
                      <SelectItem value="status">Status View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Network Diagram */}
              <div className="lg:col-span-3">
                <Card className="h-full diagram-container">
                  <CardContent className="p-4">
                    <h2 className="text-lg font-semibold mb-4">Single Line Diagram</h2>
                    <DiagramToolbar />
                    <SingleLineDiagram 
                      region={region} 
                      showLabels={showLabels}
                      viewMode={viewMode}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Side Panel */}
              <div className="lg:col-span-1 space-y-4">
                <SystemStatus />
                <ActiveIssues issues={dashboardData?.activeAlerts || []} />
                
                {dashboardData?.activeWorkPermits && dashboardData.activeWorkPermits.length > 0 && (
                  <WorkPermitCard workPermit={dashboardData.activeWorkPermits[0]} />
                )}
              </div>
            </div>
            
            {/* Bottom Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <EnergyFlowSummary />
              <EquipmentStatus 
                equipmentSummary={dashboardData?.equipmentSummary || {
                  transformers: { total: 0, online: 0, offline: 0 },
                  circuitBreakers: { total: 0, closed: 0, open: 0 },
                  feeders: { total: 0, normal: 0, warning: 0, fault: 0 },
                  maintenanceDue: 0
                }}
              />
              <RecentActivities activities={dashboardData?.recentActivity || []} />
            </div>
          </TabsContent>
          
          <TabsContent value="energy-flow">
            <Card>
              <CardContent className="p-6 h-96 flex items-center justify-center">
                <p className="text-neutral-500">Energy Flow view will be available in the next release.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="substation-view">
            <Card>
              <CardContent className="p-6 h-96 flex items-center justify-center">
                <p className="text-neutral-500">Substation View will be available in the next release.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="distribution-feeders">
            <Card>
              <CardContent className="p-6 h-96 flex items-center justify-center">
                <p className="text-neutral-500">Distribution Feeders view will be available in the next release.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
