import { TripEditView } from "../../_components/TripEditView";

export default async function TripEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TripEditView id={id} />;
}
