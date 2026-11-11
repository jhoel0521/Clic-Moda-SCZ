import { useState } from 'react';
import { variantUrl, type MediaItem } from '../lib/media';
import { Card, Field } from './ui';

interface CardProps {
  image: string;
  title: string;
  description: string;
  host: string;
}

// Simulaciones de cómo se ve el enlace en cada canal (aproximadas: cada app cambia su diseño).
function WhatsAppCard({ image, title, description, host }: CardProps) {
  return (
    <div className="max-w-xs overflow-hidden rounded-lg bg-[#d9fdd3] p-1 text-black shadow">
      <img src={image} alt="" className="aspect-[1.91/1] w-full rounded-md object-cover" />
      <div className="px-2 py-1.5">
        <p className="line-clamp-2 text-sm font-semibold">{title}</p>
        <p className="line-clamp-2 text-xs text-neutral-700">{description}</p>
        <p className="text-xs text-neutral-600">{host}</p>
      </div>
    </div>
  );
}

function FacebookCard({ image, title, description, host }: CardProps) {
  return (
    <div className="max-w-md overflow-hidden border border-neutral-300 bg-white text-black">
      <img src={image} alt="" className="aspect-[1.91/1] w-full object-cover" />
      <div className="bg-neutral-100 px-3 py-2">
        <p className="text-xs text-neutral-600 uppercase">{host}</p>
        <p className="line-clamp-2 font-semibold">{title}</p>
        <p className="line-clamp-1 text-sm text-neutral-700">{description}</p>
      </div>
    </div>
  );
}

function XCard({ image, title, host }: CardProps) {
  return (
    <div className="relative max-w-md overflow-hidden rounded-2xl border border-neutral-300 bg-white text-black">
      <img src={image} alt="" className="aspect-[1.91/1] w-full object-cover" />
      <p className="absolute bottom-2 left-2 max-w-[90%] truncate rounded bg-black/70 px-2 py-0.5 text-xs text-white">
        {title}
      </p>
      <p className="px-3 py-2 text-sm text-neutral-600">{host}</p>
    </div>
  );
}

const CHANNELS = [
  { name: 'WhatsApp', render: WhatsAppCard },
  { name: 'Facebook', render: FacebookCard },
  { name: 'X', render: XCard },
] as const;

interface Props {
  item: MediaItem;
  host: string;
}

export default function ShareCards({ item, host }: Props) {
  const [title, setTitle] = useState(item.alt);
  const [description, setDescription] = useState('Calzado con envío a domicilio o recojo en el almacén.');
  const image = variantUrl(item, 'link');
  return (
    <Card className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-bold">Así se verá al compartir el enlace</h2>
      <Field label="Título de ejemplo" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} />
      <Field
        label="Descripción de ejemplo"
        value={description}
        maxLength={160}
        onChange={(e) => setDescription(e.target.value)}
      />
      {CHANNELS.map(({ name, render: Channel }) => (
        <section key={name} aria-label={`Vista previa en ${name}`} className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold">{name}</h3>
          <Channel image={image} title={title} description={description} host={host} />
        </section>
      ))}
    </Card>
  );
}
