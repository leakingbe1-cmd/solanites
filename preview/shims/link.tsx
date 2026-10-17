import type { AnchorHTMLAttributes, ReactNode } from "react";
import { navigate } from "../router";

export default function Link({ href, children, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  return (
    <a
      {...rest}
      href={href.startsWith("/") ? `#${href.slice(1).split("#").pop() || ""}` : href}
      onClick={(e) => {
        onClick?.(e);
        if (href.startsWith("/")) {
          e.preventDefault();
          navigate(href);
        }
      }}
    >
      {children}
    </a>
  );
}
