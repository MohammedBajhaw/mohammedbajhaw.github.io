import { notFound } from "next/navigation";
import { PublicationDetailContent } from "@/components/public/PublicationDetailContent";
import { createPortfolioClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getPortfolioSnapshot } from "@/lib/portfolio";

export async function generateStaticParams() {
  const portfolio = await getPortfolioSnapshot();
  return portfolio.publications.map((publication) => ({ id: String(publication.id) }));
}

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publicationId = Number(id);
  if (!Number.isInteger(publicationId) || !isSupabaseConfigured) notFound();
  const supabase = createPortfolioClient();
  const [{ data: publication }, { data: profile }] = await Promise.all([
    supabase.from("publications").select("*").eq("id", publicationId).maybeSingle(),
    supabase.from("profiles").select("name").limit(1).maybeSingle(),
  ]);
  if (!publication) notFound();
  return <PublicationDetailContent initialPublication={publication} initialProfile={profile} publicationId={publicationId} />;
}
