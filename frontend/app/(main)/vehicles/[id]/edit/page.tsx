import { VehicleEditView } from "../../_components/VehicleEditView";

export default async function VehicleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VehicleEditView id={id} />;
}
