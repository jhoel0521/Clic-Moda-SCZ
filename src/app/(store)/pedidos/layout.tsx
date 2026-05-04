import { RequireAuth } from '@src/core/guards/RequireAuth';

export default function PedidosLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
