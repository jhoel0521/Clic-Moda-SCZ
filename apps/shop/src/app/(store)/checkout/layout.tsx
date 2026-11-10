import { RequireAuth } from '@src/core/guards/RequireAuth';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
