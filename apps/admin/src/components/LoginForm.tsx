import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../lib/client-api';
import { safeNext } from '../lib/session';
import { Button, ErrorBanner, Field } from './ui';

function useLogin(next: string | undefined) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(email: string, password: string): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await api('POST', 'login', { email, password });
      window.location.assign(safeNext(next));
    } catch (failure) {
      const known = failure instanceof ApiError;
      setError(known ? failure.message : 'No se pudo conectar con el servidor');
      setBusy(false);
    }
  }
  return { error, busy, submit };
}

interface FieldsProps {
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
}

function LoginFields({ email, password, onEmail, onPassword }: FieldsProps) {
  return (
    <>
      <Field
        label="Correo"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => onEmail(e.target.value)}
      />
      <Field
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => onPassword(e.target.value)}
      />
    </>
  );
}

export default function LoginForm({ next }: { next?: string }) {
  const { error, busy, submit } = useLogin(next);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit(email, password);
  };
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <LoginFields email={email} password={password} onEmail={setEmail} onPassword={setPassword} />
      <Button type="submit" disabled={busy || !email || !password}>
        {busy ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}
