"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/dashboard", "Dashboard"],
  ["/patients", "Patients"],
  ["/medicines", "Medicines"],
  ["/tests", "Tests"],
  ["/prescriptions", "Prescriptions"],
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="nav-list">
      {links.map(([href, label]) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            className={`nav-link${active ? " nav-link-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="nav-link-indicator" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
