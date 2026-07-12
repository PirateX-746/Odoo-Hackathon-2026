import { TripDetailView } from "../_components/TripDetailView";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TripDetailView id={id} />;
}
