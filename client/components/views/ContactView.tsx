import { Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { ChannelCard, ChannelCardSkeleton, type Channel } from "@/components/cards/ChannelCard";
import { PageShell } from "@/components/layout/PageShell";
import { ContactForm, ContactFormSkeleton } from "@/components/sections/contact/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/lib/i18n/server";
import type { ContactData } from "@/lib/services";
import { formatPhone } from "@/lib/site";

export async function ContactView({ data }: { data: ContactData }) {
  const { t } = await getI18n();
  const { profile, channels: info } = data;

  const channels: Channel[] = [
    ...(info.email
      ? [{ label: t("contact.email"), value: info.email, href: `mailto:${info.email}`, icon: <Mail size={18} /> }]
      : []),
    ...(info.phone
      ? [
          {
            label: t("contact.phone"),
            value: formatPhone(info.phone),
            href: `tel:${info.phone.replace(/\s/g, "")}`,
            icon: <Phone size={18} />,
          },
        ]
      : []),
    ...(info.linkedinUrl
      ? [{ label: t("contact.linkedin"), value: info.linkedinUrl.replace(/^https?:\/\/(www\.)?/, ""), href: info.linkedinUrl, icon: <Linkedin size={18} />, external: true }]
      : []),
    ...(info.githubUrl
      ? [{ label: t("contact.github"), value: info.githubUrl.replace(/^https?:\/\/(www\.)?/, ""), href: info.githubUrl, icon: <Github size={18} />, external: true }]
      : []),
    ...(info.location
      ? [{ label: t("contact.location"), value: info.location, icon: <MapPin size={18} /> }]
      : []),
  ];

  return (
    <PageShell profile={profile} mainClassName="min-h-screen">
      <div className="w-full bg-white">
        {/* Soft canvas intro stage with the official bottom curve */}
        <div className="relative md:sticky md:top-0 z-0 w-full bg-[#0b2220] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pt-28 pb-14 sm:pt-36 sm:pb-20 overflow-hidden">
          <div
            className="pointer-events-none absolute -top-24 end-[-6%] w-[520px] h-[420px] rounded-full bg-radial from-[#176b69]/75 via-[#102927]/40 to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 start-[-8%] w-[460px] h-[360px] rounded-full bg-radial from-[#176b69]/50 via-[#102927]/30 to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="shell relative z-10">
            <Reveal immediate delay={20}>
              <p className="mono-eyebrow m-0 mb-3 text-[#86dcd2]!">{t("contact.eyebrow")}</p>
              <h1 className="m-0 max-w-[900px] font-sans font-extrabold text-[clamp(34px,5vw,64px)] leading-[1.04] tracking-[-0.045em] bg-linear-to-r rtl:bg-linear-to-l from-[#ffffff] via-[#bfe8df] to-[#63bdb0] pb-[0.14em] bg-clip-text text-transparent">
                {t("contact.title")}
              </h1>
            </Reveal>
            <Reveal immediate delay={90}>
              <p className="m-0 mt-5 max-w-[640px] font-sans text-[15px] sm:text-[17px] leading-[1.75] text-[#aab3b2] rtl:text-[18.5px] rtl:sm:text-[20.5px]">
                {t("contact.body")}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Channels + message form on the pure white stage */}
        <section className="relative z-10 w-full bg-white rounded-t-[56px] sm:rounded-t-[88px] md:rounded-t-[110px] py-[56px] md:py-[88px]">
          <div className="shell relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-8 lg:gap-12 items-start">
            <Reveal>
              <p className="mono-eyebrow m-0 mb-4">{t("contact.channels")}</p>
              <ul className="m-0 p-0 list-none grid gap-3">
                {channels.map((channel) => (
                  <li key={channel.label}>
                    <ChannelCard channel={channel} />
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={70}>
              <div className="rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] border-0 px-6 py-7 sm:px-9 sm:py-9">
                <p className="mono-eyebrow m-0 mb-2">{t("contact.sendEyebrow")}</p>
                <h2 className="m-0 mb-6 font-sans font-extrabold text-[clamp(24px,2.6vw,32px)] leading-[1.1] tracking-[-0.04em] text-[#0f2422]">
                  {t("contact.sendHeading")}
                </h2>
                <ContactForm email={info.email} />
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export async function ContactViewSkeleton() {
  const { t } = await getI18n();
  return (
    <div className="w-full bg-white" role="status" aria-label={t("a11y.loadingContact")}>
      <div className="w-full bg-[#0b2220] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pt-28 pb-14 sm:pt-36 sm:pb-20">
        <div className="shell grid gap-3">
          <Skeleton tone="dark" className="h-3.5 w-24 rounded-full" />
          <Skeleton tone="dark" className="h-12 w-[88%] max-w-[820px] rounded-[12px]" />
          <Skeleton tone="dark" className="h-12 w-[52%] max-w-[480px] rounded-[12px]" />
          <Skeleton tone="dark" className="mt-2 h-4.5 w-[56%] max-w-[560px] rounded-full" />
        </div>
      </div>
      <section className="w-full py-[56px] md:py-[88px]">
        <div className="shell grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-8 lg:gap-12 items-start">
          <div className="grid gap-3">
            <Skeleton className="h-3.5 w-32 rounded-full mb-1" />
            {Array.from({ length: 5 }).map((_, i) => (
              <ChannelCardSkeleton key={i} />
            ))}
          </div>
          <div className="rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] px-6 py-7 sm:px-9 sm:py-9 grid gap-4">
            <Skeleton className="h-3.5 w-28 rounded-full" />
            <Skeleton className="h-8 w-[60%] rounded-[10px] mb-3" />
            <ContactFormSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
