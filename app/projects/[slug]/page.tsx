import { notFound } from "next/navigation";
import { ProjectDetailContent } from "@/components/public/ProjectDetailContent";
import { createPortfolioClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getPortfolioSnapshot } from "@/lib/portfolio";

export async function generateStaticParams() {
  const portfolio = await getPortfolioSnapshot();
  return portfolio.projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSupabaseConfigured) notFound();
  const supabase = createPortfolioClient();
  const [{ data: project }, { data: profile }] = await Promise.all([
    supabase.from("projects").select("*, project_media(*)").eq("slug", slug).maybeSingle(),
    supabase.from("profiles").select("name").limit(1).maybeSingle(),
  ]);
  if (!project) notFound();
  return <ProjectDetailContent initialProject={project} initialProfile={profile} slug={slug} />;
}
