import { useState } from 'react';
import { setShelf, shelfOf } from '../lib/shelf';
import { errorMessage, type Product } from '../lib/types';
import { Button, ErrorBanner, Field } from './ui';

function useShelf(product: Product, onSaved: () => void) {
  const [value, setValue] = useState(shelfOf(product));
  const [error, setError] = useState<string | null>(null);
  const save = () =>
    setShelf(product, value).then(
      () => (setError(null), onSaved()),
      (failure) => setError(errorMessage(failure))
    );
  return { value, setValue, error, save };
}

// Dónde está la caja del modelo en el almacén (un solo estante para todas sus tallas y colores).
export default function ShelfEditor({ product, onSaved }: { product: Product; onSaved: () => void }) {
  const { value, setValue, error, save } = useShelf(product, onSaved);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Field
            label="Estante del modelo"
            placeholder="Ej: Estante B6"
            value={value}
            maxLength={100}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={() => void save()}>
          Guardar estante
        </Button>
      </div>
      {error && <ErrorBanner>{error}</ErrorBanner>}
    </div>
  );
}
