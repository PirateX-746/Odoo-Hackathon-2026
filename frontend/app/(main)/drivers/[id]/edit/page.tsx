import { DriverEditView } from "../../_components/DriverEditView";

export default async function DriverEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DriverEditView id={id} />;
}
