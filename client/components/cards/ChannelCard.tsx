import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export type Channel = { label: string; value: string; href?: string; icon: ReactNode; external?: boolean };

const FRAME =
  "relative flex items-center gap-4 rounded-[24px] sm:rounded-[28px] bg-[#f4f8f7] border-0 overflow-hidden px-5 py-4 sm:px-6 sm:py-5";

export function ChannelCard({ channel }: { channel: Channel }) {
  const body = (
    <>
      {/* Inner-edge brand-teal mist glow on hover (frame stays fixed) */}
      {channel.href && (
        <span
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] shadow-[inset_0_0_24px_rgba(23,107,105,0.22),inset_0_0_46px_rgba(38,140,137,0.12)] opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 text-teal shrink-0" aria-hidden="true">
        {channel.icon}
      </span>
      <span className="relative z-10 min-w-0">
        <span className="block font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-[#6d827f] rtl:text-[13.5px]">
          {channel.label}
        </span>
        <span className="block mt-0.5 font-sans text-[15px] sm:text-[16px] font-bold text-[#0f2422] origin-left rtl:origin-right [unicode-bidi:isolate] transition-transform duration-180 ease-out-expo group-hover:scale-[1.03] break-all rtl:text-[15.5px] rtl:sm:text-[19.5px]">
          <bdi dir="ltr">{channel.value}</bdi>
        </span>
      </span>
    </>
  );

  const cls = `group ${FRAME} focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2`;

  if (!channel.href) return <div className={cls}>{body}</div>;
  return (
    <a href={channel.href} className={cls} {...(channel.external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {body}
    </a>
  );
}

export function ChannelCardSkeleton() {
  return (
    <div className={FRAME} aria-hidden="true">
      <Skeleton className="h-[18px] w-[18px] shrink-0 rounded-full" />
      <span className="grid gap-2 min-w-0 flex-1">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-4 w-[60%] rounded-full" />
      </span>
    </div>
  );
}
