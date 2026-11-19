import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/lib/i18n/server";
import type { Service } from "@/lib/types";

const pad = (n: number) => String(n).padStart(2, "0");

export async function ServiceCard({ service, index }: { service: Service; index: number }) {
  const { t } = await getI18n();
  const deliverables: string[] = service.deliverables ?? [];
  return (
    <div className="group relative flex w-full flex-col justify-between rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] border-0 overflow-hidden px-6 py-6 sm:px-7 sm:py-7">
      {/* Inner-edge brand-teal mist glow on hover (center stays clean, frame stays fixed) */}
      <span
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] shadow-[inset_0_0_24px_rgba(23,107,105,0.22),inset_0_0_46px_rgba(38,140,137,0.12)] opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="relative z-10">
        <span className="font-sans text-[12px] font-extrabold tracking-[0.08em] text-teal rtl:text-[14.5px]">{pad(index + 1)}</span>
        <h3 className="mt-3 mb-2.5 font-sans text-[18px] sm:text-[20px] font-bold leading-[1.28] tracking-[-0.025em] text-[#0f2422] origin-left rtl:origin-right transition-transform duration-180 ease-out-expo group-hover:scale-[1.03] rtl:text-[22px]">
          {service.title}
        </h3>
        <p className="m-0 font-sans text-[14px] leading-[1.7] text-[#526563] rtl:text-[17px]">{service.summary}</p>
      </div>

      {deliverables.length > 0 && (
        <div className="relative z-10 mt-6 pt-4 border-t border-[#e1ecea]">
          <p className="m-0 mb-1.5 font-sans text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#6d827f] rtl:text-[13px]">
            {t("services.deliverables")}
          </p>
          <p className="m-0 font-sans text-[12.5px] font-medium leading-[1.6] text-[#284542] rtl:text-[15.5px]">
            {deliverables.join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div
      className="relative flex w-full flex-col justify-between rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] border-0 overflow-hidden px-6 py-6 sm:px-7 sm:py-7"
      aria-hidden="true"
    >
      <div className="relative z-10">
        <Skeleton className="h-3 w-6 rounded-full" />
        <div className="mt-3 mb-2.5 grid gap-2">
          <Skeleton className="h-5.5 w-[85%] rounded-[8px]" />
          <Skeleton className="h-5.5 w-[55%] rounded-[8px]" />
        </div>
        <div className="grid gap-2">
          <Skeleton className="h-3.5 w-full rounded-full" />
          <Skeleton className="h-3.5 w-[92%] rounded-full" />
          <Skeleton className="h-3.5 w-[64%] rounded-full" />
        </div>
      </div>
      <div className="relative z-10 mt-6 pt-4 border-t border-[#e1ecea] grid gap-2">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-3.5 w-[80%] rounded-full" />
      </div>
    </div>
  );
}
