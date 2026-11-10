import { useState } from 'react';

interface GreetingProps {
  name: string;
}

export default function Greeting({ name }: GreetingProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold text-rose-700">Panel de administración</h1>
      <button
        type="button"
        className="mt-4 rounded bg-neutral-900 px-4 py-2 text-white"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Ocultar saludo' : 'Mostrar saludo'}
      </button>
      {open && <p className="mt-4">Hola, {name}.</p>}
    </section>
  );
}
