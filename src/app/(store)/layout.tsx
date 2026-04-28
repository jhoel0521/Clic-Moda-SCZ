import { StoreNavbar } from '@src/shared/ui/StoreNavbar';
import { StoreFooter } from '@src/shared/ui/StoreFooter';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <StoreNavbar />
      <main className="flex-1 w-full">{children}</main>
      <StoreFooter />
    </div>
  );
}
