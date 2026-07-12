import { MaintenanceDetailView } from "../_components/MaintenanceDetailView";

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MaintenanceDetailView id={id} />;
}
