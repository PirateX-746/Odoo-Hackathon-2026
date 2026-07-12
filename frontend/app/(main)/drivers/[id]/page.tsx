import { DriverDetailView } from "../_components/DriverDetailView";

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DriverDetailView id={id} />;
}
