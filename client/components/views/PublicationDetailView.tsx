import { ArrowUpRight } from "lucide-react";
import { DETAIL_ROW, DetailPanel, DetailPanelSkeleton } from "@/components/cards/DetailPanel";
import { PageShell } from "@/components/layout/PageShell";
import { DetailHeader, DetailHeaderSkeleton } from "@/components/sections/detail/DetailHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/lib/i18n/server";
import { sanitizeProjectRichContent } from "@/lib/richText";
import type { Profile, Publication } from "@/lib/types";

const LABEL = "block mb-1 font-sans text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#6d827f] rtl:text-[13px]";
const VALUE = "font-medium text-[#284542]";

export async function PublicationDetailView({
  publication,
  profile,
}: {
  publication: Publication;
  profile: Profile | null;
}) {
  const { t, href } = await getI18n();
  const documentUrl = publication.url || null;
  const doiUrl = publication.doi ? `https://doi.org/${publication.doi}` : null;
  const detailsHtml = /^\s*</.test(String(publication.details ?? ""));
  const keywords: string[] = publication.keywords ?? [];
  const meta = [publication.venue, publication.publication_date, publication.doi ? t("publicationDetail.doiLine", { doi: publication.doi }) : null].filter(
    Boolean,
  );

  return (
    <PageShell profile={profile} mainClassName="min-h-screen">
      <div className="w-full bg-white">
        <DetailHeader
          backHref={href("/#publications")}
          backLabel={t("publicationDetail.back")}
          eyebrow={publication.status ?? t("publicationDetail.defaultEyebrow")}
          title={publication.title}
          summary={publication.summary}
        >
          {meta.length > 0 && (
            <p className="m-0 mt-5 max-w-[820px] font-sans text-[12.5px] font-semibold leading-[1.7] text-[#929d9c] rtl:text-[15.5px]">
              {meta.join(" · ")}
            </p>
          )}
        </DetailHeader>

        <div className="relative z-10 w-full bg-white rounded-t-[56px] sm:rounded-t-[88px] md:rounded-t-[110px]">
        <section className="relative w-full py-[56px] md:py-[88px]">
          <div className="shell grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.5fr)] gap-10 lg:gap-14 items-start">
            <Reveal>
              <article>
                {detailsHtml ? (
                  <section
                    className="rich-content mt-0 [&_h2]:pt-3.5 [&_h2]:border-t [&_h2]:border-[#e1ecea] [&_h2:first-child]:pt-0 [&_h2:first-child]:border-t-0 [&_h2:first-child]:mt-0 [&_ol]:text-[13px] [&_ol]:leading-[1.7]"
                    dangerouslySetInnerHTML={{ __html: sanitizeProjectRichContent(publication.details) }}
                  />
                ) : (
                  <>
                    <p className="mono-eyebrow m-0 mb-4">{t("publicationDetail.abstract")}</p>
                    <p className="m-0 font-sans text-[16px] leading-[1.85] text-[#3f5350] rtl:text-[19.5px]">
                      {publication.details ?? publication.summary}
                    </p>
                  </>
                )}
                {keywords.length > 0 && (
                  <>
                    <p className="mono-eyebrow m-0 mt-12 mb-3">{t("publicationDetail.keywords")}</p>
                    <p className="m-0 font-sans text-[13px] font-medium leading-[1.8] text-[#637876] rtl:text-[16px]">
                      {keywords.join(" · ")}
                    </p>
                  </>
                )}
              </article>
            </Reveal>

            <aside className="lg:sticky lg:top-28 self-start">
              <DetailPanel title={t("publicationDetail.details")}>
                <ul className="m-0 p-0 list-none">
                  <li className={DETAIL_ROW}>
                    <span className={LABEL}>{t("publicationDetail.conference")}</span>
                    <span className={VALUE}>{publication.venue ?? t("publicationDetail.venueTbc")}</span>
                  </li>
                  <li className={DETAIL_ROW}>
                    <span className={LABEL}>{t("publicationDetail.published")}</span>
                    <span className={VALUE}>{publication.publication_date ?? t("publicationDetail.dateTbc")}</span>
                  </li>
                  <li className={DETAIL_ROW}>
                    <span className={LABEL}>{t("publicationDetail.authors")}</span>
                    <span className={VALUE}>{publication.authors ?? t("publicationDetail.authorsTbc")}</span>
                  </li>
                  {publication.doi && (
                    <li className={DETAIL_ROW}>
                      <span className={LABEL}>{t("publicationDetail.doi")}</span>
                      <span className={`${VALUE} break-all`}>{publication.doi}</span>
                    </li>
                  )}
                </ul>

                {(documentUrl || doiUrl) && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {documentUrl && (
                      <Button href={documentUrl} external target="_blank" rel="noreferrer" className="h-[46px] px-7 text-[13px] rtl:text-[16px]">
                        <span>{t("publicationDetail.openPdf")}</span>
                        <ArrowUpRight size={15} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
                      </Button>
                    )}
                    {doiUrl && (
                      <Button href={doiUrl} target="_blank" rel="noreferrer" className="h-[46px] px-7 text-[13px] rtl:text-[16px]">
                        <span>
                          {String(publication.doi).startsWith("10.1109/") ? t("publicationDetail.viewIeee") : t("publicationDetail.viewPublisher")}
                        </span>
                        <ArrowUpRight size={15} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                )}
              </DetailPanel>
            </aside>
          </div>
        </section>
        </div>
      </div>
    </PageShell>
  );
}

export async function PublicationDetailSkeleton() {
  const { t } = await getI18n();
  return (
    <div className="w-full bg-white" role="status" aria-label={t("a11y.loadingPublication")}>
      <DetailHeaderSkeleton />
      <section className="w-full bg-white rounded-t-[56px] sm:rounded-t-[88px] md:rounded-t-[110px] py-[56px] md:py-[88px]">
        <div className="shell grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.5fr)] gap-10 lg:gap-14 items-start">
          <div>
            <Skeleton className="mb-4 h-3.5 w-24 rounded-full" />
            <div className="grid gap-3">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-[97%] rounded-full" />
              <Skeleton className="h-4 w-[92%] rounded-full" />
              <Skeleton className="h-4 w-[88%] rounded-full" />
              <Skeleton className="h-4 w-[60%] rounded-full" />
            </div>
            <Skeleton className="mt-12 mb-3 h-3.5 w-20 rounded-full" />
            <Skeleton className="h-4 w-[70%] rounded-full" />
          </div>
          <div className="grid gap-5">
            <DetailPanelSkeleton rows={4} />
          </div>
        </div>
      </section>
    </div>
  );
}
