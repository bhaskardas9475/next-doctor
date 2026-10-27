import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/layout/nav-links";
import { logoutAction } from "@/server/actions/auth";

export function Sidebar() {
  return (
    <aside className="sidebar no-print">
      <Link href="/dashboard" className="brand">
        Next Doctor
      </Link>
      <NavLinks />
      <form action={logoutAction} className="logout-form desktop-logout">
        <Button className="button-secondary" htmlType="submit">
          Log out
        </Button>
      </form>
      <form action={logoutAction} className="logout-form mobile-logout">
        <Button className="button-secondary" htmlType="submit">
          Log out
        </Button>
      </form>
    </aside>
  );
}
