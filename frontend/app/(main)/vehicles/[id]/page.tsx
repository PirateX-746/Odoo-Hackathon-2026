import { VehicleDetailView } from "../_components/VehicleDetailView";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VehicleDetailView id={id} />;
}
