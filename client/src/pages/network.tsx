import { AppLayout } from "@/layouts/app-layout";
import { SingleLineDiagram } from "@/components/network/single-line-diagram";

export default function NetworkPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Network Management</h2>
            <p className="text-muted-foreground">
              View and manage your distribution network topology and connections.
            </p>
          </div>
        </div>
        
        <SingleLineDiagram />
      </div>
    </AppLayout>
  );
}
