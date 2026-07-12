import { ExpenseEditView } from "../../_components/ExpenseEditView";

export default async function ExpenseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExpenseEditView id={id} />;
}
