import { AppLayout } from "@/layouts/app-layout";
import { PermitTable } from "@/components/permits/permit-table";

export default function PermitsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <PermitTable />
      </div>
    </AppLayout>
  );
}
