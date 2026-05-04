import { RequireAuth } from '@src/core/guards/RequireAuth';

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
