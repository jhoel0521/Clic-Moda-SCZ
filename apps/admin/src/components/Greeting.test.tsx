import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Greeting from './Greeting';

test('la isla muestra el saludo solo después de pulsar el botón', () => {
  render(<Greeting name="Gerente" />);

  expect(screen.queryByText('Hola, Gerente.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Mostrar saludo' }));

  expect(screen.getByText('Hola, Gerente.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Ocultar saludo' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
});
