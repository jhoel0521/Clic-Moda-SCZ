import { api } from '../lib/client-api';
import { Button, IconButton } from './ui';

// `compact`: solo el ícono (barra superior del móvil); si no, botón completo (barra lateral).
export default function LogoutButton({ compact }: { compact?: boolean }) {
  const logout = async () => {
    await api('POST', 'logout').catch(() => undefined);
    window.location.assign('/login');
  };
  if (compact) return <IconButton icon="logout" label="Salir" onClick={() => void logout()} />;
  return (
    <Button variant="secondary" icon="logout" block onClick={() => void logout()}>
      Salir
    </Button>
  );
}
