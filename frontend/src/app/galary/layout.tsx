// Studio renders within the root layout, but the page itself
// uses position:fixed + z-index to cover the full viewport.
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
