export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Admin pages use a clean layout without the main site nav/footer
  return <>{children}</>;
}
