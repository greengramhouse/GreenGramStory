// app/dashboard/posts/page.tsx — Server Component
import { getPostsAction } from "@/action/post";
import PostsTable from "@/components/dashboard/posts-table";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function PostsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page ?? 1));
  const search = params?.search ?? "";

  const data = await getPostsAction(page, search);

  return <PostsTable data={data} search={search} />;
}
