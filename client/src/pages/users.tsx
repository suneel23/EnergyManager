import { AppLayout } from "@/layouts/app-layout";
import { UserTable } from "@/components/users/user-table";

export default function UsersPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <UserTable />
      </div>
    </AppLayout>
  );
}
