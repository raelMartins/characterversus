import Link from "next/link";
import { SITE_NAME } from "@/lib/brand";
import type { SkinKey } from "@/lib/options";
import { HeaderControls } from "./HeaderControls";

export function Header({ skin }: { skin: SkinKey }) {
  return (
    <header className="site-header">
      <Link href="/" className="logo" aria-label={`${SITE_NAME} home`}>
        <span className="logo-a">WHO</span>
        <span className="logo-b">WINS?!</span>
      </Link>
      <nav className="site-nav" aria-label="Main">
        <Link href="/#fights">Fights</Link>
        <Link href="/characters">Characters</Link>
      </nav>
      <HeaderControls skin={skin} />
    </header>
  );
}
