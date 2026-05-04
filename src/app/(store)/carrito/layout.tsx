import { RequireAuth } from '@src/core/guards/RequireAuth';

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
