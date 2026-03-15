// app/dashboard/users/page.tsx  — Server Component
import { getUsersAction } from "@/action/user";
import UsersTable from "@/components/dashboard/users-table";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page ?? 1));
  const search = params?.search ?? "";

  const data = await getUsersAction(page, search);

  return <UsersTable data={data} search={search} />;
}
