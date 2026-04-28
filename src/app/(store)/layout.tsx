import { StoreNavbar } from '@src/shared/ui/StoreNavbar';
import { StoreFooter } from '@src/shared/ui/StoreFooter';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full justify-center items-center">
      <StoreNavbar />
      <main className="flex-grow flex flex-col w-full max-w-[1600px] mx-auto !px-6 !lg:px-12 !pt-8 !pb-16">
        {children}
      </main>
      <StoreFooter />
    </div>
  );
}