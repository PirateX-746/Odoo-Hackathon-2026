import { FuelLogEditView } from "../../_components/FuelLogEditView";

export default async function FuelLogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FuelLogEditView id={id} />;
}
