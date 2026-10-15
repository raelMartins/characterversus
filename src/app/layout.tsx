import type { Metadata } from "next";
import {
  Archivo,
  Bangers,
  Bungee,
  Chakra_Petch,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Patrick_Hand_SC,
  Saira_Condensed,
} from "next/font/google";
import { FigureDefs } from "@/components/Figure";
import { Header } from "@/components/Header";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";
import { readPrefs } from "@/lib/prefs";
import "./globals.css";
import "./skins/comic.css";
import "./skins/arcade.css";
import "./skins/broadcast.css";

// Comic is the default skin, so only its faces preload.
const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--f-bangers" });
const archivo = Archivo({ subsets: ["latin"], variable: "--f-archivo" });
const patrick = Patrick_Hand_SC({ weight: "400", subsets: ["latin"], variable: "--f-patrick" });
const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--f-bungee", preload: false });
const chakra = Chakra_Petch({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--f-chakra", preload: false });
const saira = Saira_Condensed({ weight: ["500", "700", "800", "900"], subsets: ["latin"], variable: "--f-saira", preload: false });
const plexSans = IBM_Plex_Sans({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--f-plex", preload: false });
const plexMono = IBM_Plex_Mono({ weight: ["500", "600"], subsets: ["latin"], variable: "--f-plexmono", preload: false });

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} · Who would win?`, template: `%s · ${SITE_NAME}` },
  description: SITE_TAGLINE,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { skin, theme } = await readPrefs();
  const fonts = [bangers, archivo, patrick, bungee, chakra, saira, plexSans, plexMono].map((f) => f.variable).join(" ");
  return (
    <html lang="en" data-skin={skin} data-theme={theme ?? undefined} className={fonts} suppressHydrationWarning>
      <body>
        <FigureDefs />
        <div className="shell">
          <Header skin={skin} />
          <main className="main">{children}</main>
          <footer className="site-footer">
            <p>
              {SITE_NAME} is a fan project. Characters belong to their creators. Profiles are built from fan wikis (CC BY-SA) and judged by AI, so argue with us if we got it wrong.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
