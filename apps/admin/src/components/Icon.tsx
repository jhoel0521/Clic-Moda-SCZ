import { ICONS, type IconName } from '../lib/icons';

interface Props {
  name: IconName;
  className?: string;
}

// Ícono decorativo: el botón o enlace que lo contiene lleva el nombre accesible.
export default function Icon({ name, className = 'size-5' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
