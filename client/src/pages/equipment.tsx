import { AppLayout } from "@/layouts/app-layout";
import { EquipmentTable } from "@/components/equipment/equipment-table";

export default function EquipmentPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <EquipmentTable />
      </div>
    </AppLayout>
  );
}
