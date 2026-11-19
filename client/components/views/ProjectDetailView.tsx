import { ArrowUpRight } from "lucide-react";
import { DETAIL_ROW, DetailPanel, DetailPanelSkeleton } from "@/components/cards/DetailPanel";
import { PageShell } from "@/components/layout/PageShell";
import { DetailHeader, DetailHeaderSkeleton } from "@/components/sections/detail/DetailHeader";
import { Button } from "@/components/ui/Button";
import { MediaGallery, MediaGallerySkeleton } from "@/components/ui/MediaGallery";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/lib/i18n/server";
import { sanitizeProjectRichContent } from "@/lib/richText";
import type { Profile, Project } from "@/lib/types";

const pad = (n: number) => String(n).padStart(2, "0");

export async function ProjectDetailView({
  project,
  profile,
}: {
  project: Project;
  profile: Profile | null;
}) {
  const { t, href } = await getI18n();
  const media = [...(project.project_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const richContent = sanitizeProjectRichContent(project.rich_content);
  const infoRows: { label: string; value: string }[] = project.info ?? [];
  const tags: string[] = project.tags ?? [];
  const tools: string[] = project.tools ?? [];
  const outcomes: string[] = project.outcomes ?? [];

  return (
    <PageShell profile={profile} mainClassName="min-h-screen">
      <div className="w-full bg-white">
        <DetailHeader
          backHref={href("/projects")}
          backLabel={t("projectDetail.back")}
          eyebrow={project.status}
          title={project.title}
          summary={project.summary}
        >
          {tags.length > 0 && (
            <p className="m-0 mt-5 max-w-[820px] font-sans text-[12.5px] font-medium leading-[1.7] text-[#929d9c] rtl:text-[15.5px]">
              {tags.join(" · ")}
            </p>
          )}
          {(project.repository_url || project.publication_url) && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {project.repository_url && (
                <Button href={project.repository_url} target="_blank" rel="noreferrer" className="h-[46px] px-7 text-[13px] rtl:text-[16px]">
                  <span>{t("projectDetail.viewSource")}</span>
                  <ArrowUpRight size={15} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
                </Button>
              )}
              {project.publication_url && (
                <Button
                  href={href(project.publication_url)}
                  {...(/^https?:/i.test(project.publication_url) ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="h-[46px] px-7 text-[13px] rtl:text-[16px]"
                >
                  <span>{t("projectDetail.relatedPublication")}</span>
                  <ArrowUpRight size={15} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </DetailHeader>

        <div className="relative z-10 w-full bg-white rounded-t-[56px] sm:rounded-t-[88px] md:rounded-t-[110px]">
        <section className="relative w-full pt-[56px] pb-[40px] md:pt-[88px] md:pb-[56px]">
          <div className="shell grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.5fr)] gap-10 lg:gap-14 items-start">
            <Reveal>
              <article>
                {infoRows.length > 0 && (
                  <dl className="m-0 mb-10 rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] border-0 px-6 py-3 sm:px-7">
                    {infoRows.map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-4 py-3.5 border-b border-[#e1ecea] last:border-b-0"
                      >
                        <dt className="font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-[#6d827f] leading-[1.9] rtl:text-[13.5px]">
                          {row.label}
                        </dt>
                        <dd className="m-0 font-sans text-[14.5px] font-medium leading-[1.65] text-[#284542] rtl:text-[17.5px]">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <p className="mono-eyebrow m-0 mb-4">{t("projectDetail.overview")}</p>
                {String(project.description ?? "")
                  .split("\n\n")
                  .filter(Boolean)
                  .map((paragraph: string) => (
                    <p className="m-0 mb-4 font-sans text-[16px] leading-[1.85] text-[#3f5350] rtl:text-[19.5px]" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                {richContent && <section className="rich-content" dangerouslySetInnerHTML={{ __html: richContent }} />}
              </article>
            </Reveal>

            <aside className="grid gap-5 lg:sticky lg:top-28 self-start">
              {tools.length > 0 && (
                <DetailPanel title={t("projectDetail.systemStack")}>
                  <ul className="m-0 p-0 list-none">
                    {tools.map((tool) => (
                      <li key={tool} className={`${DETAIL_ROW} font-medium text-[#284542]`}>
                        {tool}
                      </li>
                    ))}
                  </ul>
                </DetailPanel>
              )}
              {outcomes.length > 0 && (
                <DetailPanel title={t("projectDetail.outcomes")}>
                  <ul className="m-0 p-0 list-none">
                    {outcomes.map((outcome, idx) => (
                      <li key={outcome} className={`${DETAIL_ROW} flex gap-3 text-[#284542]`}>
                        <span className="shrink-0 font-sans text-[12px] font-extrabold tracking-[0.08em] text-teal rtl:text-[14.5px]">
                          {pad(idx + 1)}
                        </span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </DetailPanel>
              )}
            </aside>
          </div>
        </section>

        {media.length > 0 && (
          <section className="relative w-full pb-[56px] md:pb-[88px]">
            <div className="shell">
              <p className="mono-eyebrow m-0 mb-5">{t("projectDetail.media")}</p>
              <MediaGallery
                items={media.map((item) => ({
                  id: item.id,
                  src: item.storage_path ?? "",
                  alt: item.alt ?? project.title,
                  caption: item.alt,
                }))}
              />
            </div>
          </section>
        )}
        </div>
      </div>
    </PageShell>
  );
}

export async function ProjectDetailSkeleton() {
  const { t } = await getI18n();
  return (
    <div className="w-full bg-white" role="status" aria-label={t("a11y.loadingProject")}>
      <DetailHeaderSkeleton />
      <div className="w-full bg-white rounded-t-[56px] sm:rounded-t-[88px] md:rounded-t-[110px]">
      <section className="w-full pt-[56px] pb-[40px] md:pt-[88px] md:pb-[56px]">
        <div className="shell grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.5fr)] gap-10 lg:gap-14 items-start">
          <div>
            <div className="mb-10 rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] px-6 py-5 sm:px-7 grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-4">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-4 w-[70%] rounded-full" />
                </div>
              ))}
            </div>
            <Skeleton className="mb-4 h-3.5 w-24 rounded-full" />
            <div className="grid gap-3">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-[96%] rounded-full" />
              <Skeleton className="h-4 w-[90%] rounded-full" />
              <Skeleton className="h-4 w-[72%] rounded-full" />
            </div>
          </div>
          <div className="grid gap-5">
            <DetailPanelSkeleton rows={5} />
            <DetailPanelSkeleton rows={3} />
          </div>
        </div>
      </section>
      <section className="w-full pb-[56px] md:pb-[88px]" aria-hidden="true">
        <div className="shell">
          <Skeleton className="mb-5 h-3.5 w-16 rounded-full" />
          <MediaGallerySkeleton />
        </div>
      </section>
      </div>
    </div>
  );
}
