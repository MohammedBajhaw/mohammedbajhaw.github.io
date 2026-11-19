import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  shape?: "pill" | "circle";
  variant?: "primary" | "glass";
  className?: string;
};

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
    external?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const BASE_STYLE =
  "group rounded-full border-0 text-white font-semibold cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-2";

const VARIANT_STYLE = {
  primary:
    "bg-linear-45 from-[#0c4545] via-[#176b69] to-[#268c89] shadow-[0_10px_25px_rgba(12,69,69,0.32)]",
  glass:
    "bg-white/15 backdrop-blur-md transition-colors duration-200 hover:bg-white/25",
} as const;

const SHAPE_STYLE = {
  pill: "inline-flex items-center justify-center h-[50px] px-8 text-[13px] rtl:text-[16.5px]",
  circle: "grid w-[52px] h-[52px] place-items-center font-mono text-[12px] font-bold tracking-[0.04em] rtl:text-[14.5px]",
} as const;

const INNER_HOVER_STYLE =
  "inline-flex items-center justify-center gap-2.5 transition-transform duration-180 ease-out-expo group-hover:scale-108";

export function Button(props: ButtonProps) {
  const { children, shape = "pill", variant = "primary", className = "" } = props;
  const classes = `${BASE_STYLE} ${VARIANT_STYLE[variant]} ${SHAPE_STYLE[shape]} ${className}`.trim();
  const content = <span className={INNER_HOVER_STYLE}>{children}</span>;

  if ("href" in props && props.href !== undefined) {
    const { href, external, children: _c, shape: _s, variant: _v, className: _cn, ...anchorRest } = props;
    const isExternal = external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#");

    if (isExternal) {
      return (
        <a href={href} className={classes} {...anchorRest}>
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorRest}>
        {content}
      </Link>
    );
  }

  const { children: _c, shape: _s, variant: _v, className: _cn, type = "button", ...buttonRest } = props as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
