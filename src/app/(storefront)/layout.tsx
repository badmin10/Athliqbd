import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// SiteHeader queries the database on every render (sport list for nav).
// Setting this here, rather than on each page individually, guarantees no
// page under this layout can ever be statically prerendered at build time
// — which matters because the database isn't reachable during the build
// step on platforms like Railway (the volume only mounts once the
// container actually starts).
export const dynamic = "force-dynamic";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
