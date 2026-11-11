import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { fakeApi } from '../test/fake-api';
import LoginForm from './LoginForm';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function fill(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

it('Inicio de sesión — no deja entrar sin correo y contraseña', () => {
  fakeApi({});
  render(<LoginForm />);

  expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
});

it('Inicio de sesión — con credenciales válidas llama a /api/login y va al destino', async () => {
  const assign = vi.fn();
  vi.stubGlobal('location', { ...window.location, assign });
  const calls = fakeApi({ 'POST login': {} });
  render(<LoginForm next="/productos" />);

  fill('gerente@clicmoda.local', 'una-clave-larga');

  await vi.waitFor(() => expect(assign).toHaveBeenCalledWith('/productos'));
  expect(calls[0]?.body).toEqual({ email: 'gerente@clicmoda.local', password: 'una-clave-larga' });
});

it('Inicio de sesión — con credenciales inválidas muestra el error y no navega', async () => {
  const assign = vi.fn();
  vi.stubGlobal('location', { ...window.location, assign });
  fakeApi({ 'POST login': { status: 401, body: { message: 'Credenciales inválidas' } } });
  render(<LoginForm />);

  fill('x@y.com', 'mala-clave-123');

  expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
  expect(assign).not.toHaveBeenCalled();
});

it('Inicio de sesión — muestra un aviso claro al superar el límite de intentos', async () => {
  fakeApi({ 'POST login': { status: 429, body: { message: 'Too Many Requests' } } });
  render(<LoginForm />);

  fill('x@y.com', 'mala-clave-123');

  expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos');
});
