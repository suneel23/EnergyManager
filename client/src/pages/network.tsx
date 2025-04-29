import { AppLayout } from "@/layouts/app-layout";
import { SingleLineDiagram } from "@/components/network/single-line-diagram";

export default function NetworkPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <SingleLineDiagram />
      </div>
    </AppLayout>
  );
}
