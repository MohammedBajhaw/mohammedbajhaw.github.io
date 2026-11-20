/** An organization name with an optional suffix (location, dates). The site bundles no images: this is text only. */
export function OrgBadge({ name, suffix }: { name: string; suffix?: string }) {
  return (
    <p className="m-0 mt-1.5 text-[#5a6968] leading-[1.65]">
      {name}
      {suffix}
    </p>
  );
}
