import Image from "next/image";
import { orgLogo } from "@/lib/site";

export function OrgBadge({ name, suffix }: { name: string; suffix?: string }) {
  const logo = orgLogo(name);
  return (
    <p className="flex items-center gap-3 m-0 mt-1.5 text-[#5a6968] leading-[1.65]">
      {logo && (
        <Image
          className="shrink-0 w-14 h-14 object-contain rounded-full bg-white"
          src={logo.src}
          alt={logo.alt}
          width={56}
          height={56}
        />
      )}
      <span>
        {name}
        {suffix}
      </span>
    </p>
  );
}
