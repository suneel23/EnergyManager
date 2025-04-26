import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import GridVisualization from "@/pages/grid-visualization";
import EnergyAnalytics from "@/pages/energy-analytics";
import EquipmentInventory from "@/pages/equipment-inventory";
import PermitToWork from "@/pages/permit-to-work";
import MeterData from "@/pages/meter-data";
import UserManagement from "@/pages/user-management";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/grid-visualization" component={GridVisualization} />
      <ProtectedRoute path="/energy-analytics" component={EnergyAnalytics} />
      <ProtectedRoute path="/equipment-inventory" component={EquipmentInventory} />
      <ProtectedRoute path="/permit-to-work" component={PermitToWork} />
      <ProtectedRoute path="/meter-data" component={MeterData} />
      <ProtectedRoute path="/user-management" component={UserManagement} />
      <ProtectedRoute path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
