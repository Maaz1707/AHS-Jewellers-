import Dashboard from "@/components/admin/Dashboard";

// Same segment as the admin layout, so its title template does not apply here.
export const metadata = { title: { absolute: "Dashboard | Owner’s panel | AHS Jewellers" } };

export default function AdminDashboardPage() {
  return <Dashboard />;
}
