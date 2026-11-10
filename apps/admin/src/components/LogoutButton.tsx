import { api } from '../lib/client-api';
import { Button } from './ui';

export default function LogoutButton() {
  const logout = async () => {
    await api('POST', 'logout').catch(() => undefined);
    window.location.assign('/login');
  };
  return (
    <Button variant="secondary" onClick={() => void logout()}>
      Salir
    </Button>
  );
}
